import { StringEncoding, decodeString, trimNulls } from "../common/Util";
import initDebug from "../debug";
import { functionList, parseGenre, readNullTerminatedString } from "../parser/part/id3v2/utils";
import { UINT32_BE, UINT8 } from "../token-types";

import { AttachedPictureType } from "./AttachedPictureType";
import { TextEncodingToken } from "./TextEncoding";

import type { IWarningCollector } from "../common/INativeMetadataCollector";
import type { ID3v2MajorVersion } from "./ID3v2MajorVersion";

const debug = initDebug("music-metadata:id3v2:frame-parser");

interface IOut {
  language?: string;
  description?: string;
  text?: string;
}

interface IPicture {
  type?: string;
  description?: string;
  format?: string;
  data?: Uint8Array;
}

const defaultEnc: StringEncoding = "latin1"; // latin1 == iso-8859-1;

export class FrameParser {
  /**
   * Create id3v2 frame parser
   * @param major - Major version, e.g. (4) for  id3v2.4
   * @param warningCollector - Used to collect decode issue
   */
  constructor(private major: ID3v2MajorVersion, private warningCollector: IWarningCollector) {}

  public readData(uint8Array: Uint8Array, type: string, includeCovers: boolean) {
    if (uint8Array.length === 0) {
      this.warningCollector.addWarning(`id3v2.${this.major} header has empty tag type=${type}`);
      return;
    }

    const { encoding, bom } = TextEncodingToken.get(uint8Array, 0);
    const length = uint8Array.length;

    debug(`Parsing tag type=${type}, encoding=${encoding}, bom=${bom}`);
    switch (type.startsWith("T") ? "T*" : type) {
      case "T*": // 4.2.1. Text information frames - details
      case "IPLS": // v2.3: Involved people list
      case "MVIN":
      case "MVNM":
      case "PCS":
      case "PCST": {
        let text;
        try {
          text = trimNulls(decodeString(uint8Array.slice(1), encoding));
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }
          this.warningCollector.addWarning(
            `id3v2.${this.major} type=${type} header has invalid string value: ${error.message}`
          );
        }
        switch (type) {
          case "TXX":
          case "TXXX": {
            const [id, offset] = readNullTerminatedString(uint8Array, 1, length, encoding);

            return {
              description: id,
              text: this.splitValue(type, trimNulls(decodeString(uint8Array.slice(offset, length), encoding))),
            };
          }

          case "TMCL": // Musician credits list
          case "TIPL": // Involved people list
          case "IPLS": // Involved people list
            return functionList(this.splitValue(type, text));

          case "TRK":
          case "TRCK":
          case "TPOS":
            return text;

          case "TCOM":
          case "TEXT":
          case "TOLY":
          case "TOPE":
          case "TPE1":
          case "TSRC":
            // id3v2.3 defines that TCOM, TEXT, TOLY, TOPE & TPE1 values are separated by /
            return this.splitValue(type, text);

          case "TCO":
          case "TCON":
            return this.splitValue(type, text).flatMap((v) => parseGenre(v));

          case "PCS":
          case "PCST":
            // TODO: Why `default` not results `1` but `''`?
            return (this.major >= 4 ? this.splitValue(type, text) : [text])[0] === "" ? 1 : 0;

          default:
            return this.major >= 4 ? this.splitValue(type, text) : [text];
        }
      }

      case "PIC":
      case "APIC":
        if (!includeCovers) return;
        {
          const pic: IPicture = {};

          let offset = 4;
          let format;
          switch (this.major) {
            case 2:
              format = decodeString(uint8Array.slice(1, 4), defaultEnc); // 'latin1'; // latin1 == iso-8859-1;
              break;
            case 3:
            case 4:
              [format, offset] = readNullTerminatedString(uint8Array, 1, length);
              break;

            default:
              throw new Error(`Warning: unexpected major versionIndex: ${this.major as unknown as string}`);
          }

          pic.format = fixPictureMimeType(format);
          pic.type = AttachedPictureType[uint8Array[offset]];
          [pic.description, offset] = readNullTerminatedString(uint8Array, offset + 1, length, encoding);
          pic.data = uint8Array.slice(offset, length);

          return pic;
        }

      case "CNT":
      case "PCNT":
        return UINT32_BE.get(uint8Array, 0);

      case "SYLT": {
        // skip text encoding (1 byte),
        //      language (3 bytes),
        //      time stamp format (1 byte),
        //      content tagTypes (1 byte),
        //      content descriptor (1 byte)
        let offset = 7;

        const texts = [];
        while (offset < length) {
          const [text, zero] = readNullTerminatedString(uint8Array, offset, length, encoding);
          offset = zero + 4; // push offset forward one +  4 byte timestamp
          texts.push(text);
        }
        return texts;
      }

      case "ULT":
      case "USLT":
      case "COM":
      case "COMM": {
        const language = decodeString(uint8Array.slice(1, 4), defaultEnc);
        const [description, zero] = readNullTerminatedString(uint8Array, 4, length, encoding);
        const text = trimNulls(decodeString(uint8Array.slice(zero, length), encoding));

        return [{ language, description, text }];
      }

      case "UFID": {
        const data = readIdentifierAndData(uint8Array, 0, length);
        return { owner_identifier: data.id, identifier: data.data };
      }

      case "PRIV": {
        // private frame
        const data = readIdentifierAndData(uint8Array, 0, length);
        return { owner_identifier: data.id, data: data.data };
      }

      case "POPM": {
        // Popularimeter
        const [email, offset] = readNullTerminatedString(uint8Array, 0, length);

        const dataLen = length - offset;
        return {
          email,
          rating: UINT8.get(uint8Array, offset),
          counter: dataLen >= 5 ? UINT32_BE.get(uint8Array, offset + 1) : undefined,
        };
      }

      case "GEOB": {
        // General encapsulated object
        const [mimeType, offsetM] = readNullTerminatedString(uint8Array, 1, length);
        const [filename, offsetF] = readNullTerminatedString(uint8Array, offsetM, length);
        const [description, offsetD] = readNullTerminatedString(uint8Array, offsetF, length);

        return {
          type: mimeType,
          filename,
          description,
          data: uint8Array.slice(offsetD, length),
        };
      }

      // W-Frames:
      case "WCOM":
      case "WCOP":
      case "WOAF":
      case "WOAR":
      case "WOAS":
      case "WORS":
      case "WPAY":
      case "WPUB":
        // Decode URL
        return decodeString(uint8Array.slice(0, length), defaultEnc);

      case "WXXX": {
        // Decode URL
        const [description, offset] = readNullTerminatedString(uint8Array, 1, length, encoding);

        return {
          description,
          url: decodeString(uint8Array.slice(offset, length), defaultEnc),
        };
      }

      case "WFD":
      case "WFED":
        return readNullTerminatedString(uint8Array, 1, length, encoding)[0];

      case "MCDI": {
        // Music CD identifier
        return uint8Array.slice(0, length);
      }

      default:
        debug("Warning: unsupported id3v2-tag-type: " + type);
        return;
    }
  }

  /**
   * id3v2.4 defines that multiple T* values are separated by 0x00
   * id3v2.3 defines that TCOM, TEXT, TOLY, TOPE & TPE1 values are separated by /
   * @param tag - Tag name
   * @param text - Concatenated tag value
   * @returns Split tag value
   */
  private splitValue(tag: string, text: string): string[] {
    let values: string[] = text.split(/\0/g);
    if (this.major < 4) {
      if (values.length > 1) {
        this.warningCollector.addWarning(`ID3v2.${this.major} ${tag} uses non standard null-separator.`);
      } else {
        values = text.split(/\//g);
      }
    }
    return values.map((value) => trimNulls(value).trim());
  }
}

const fixPictureMimeType = (pictureType: string): string => {
  pictureType = pictureType.toLocaleLowerCase();
  switch (pictureType) {
    case "jpg":
      return "image/jpeg";
    case "png":
      return "image/png";
  }
  return pictureType;
};

const readIdentifierAndData = (
  uint8Array: Uint8Array,
  offset: number,
  length: number
): { id: string; data: Uint8Array } => {
  const [id, offsetI] = readNullTerminatedString(uint8Array, offset, length, defaultEnc);

  return { id, data: uint8Array.slice(offsetI, length) };
};
