import { StringEncoding, decodeString, findZeroByEncode, trimNulls } from "../common/Util";
import initDebug from "../debug";
import { Genres } from "../parser/part/id3v1/genres";
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
            const data = readIdentifierAndData(uint8Array, 1, length, encoding);
            return {
              description: data.id,
              text: this.splitValue(type, trimNulls(decodeString(data.data, encoding))),
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
              [format, offset] = readNullTerminatedLatin1String(uint8Array, 1, length);
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
        const data = readIdentifierAndData(uint8Array, 0, length, defaultEnc);
        return { owner_identifier: data.id, identifier: data.data };
      }

      case "PRIV": {
        // private frame
        const data = readIdentifierAndData(uint8Array, 0, length, defaultEnc);
        return { owner_identifier: data.id, data: data.data };
      }

      case "POPM": {
        // Popularimeter
        const [email, offset] = readNullTerminatedLatin1String(uint8Array, 0, length);

        const dataLen = length - offset;
        return {
          email,
          rating: UINT8.get(uint8Array, offset),
          counter: dataLen >= 5 ? UINT32_BE.get(uint8Array, offset + 1) : undefined,
        };
      }

      case "GEOB": {
        // General encapsulated object
        const [mimeType, offsetM] = readNullTerminatedLatin1String(uint8Array, 1, length);
        const [filename, offsetF] = readNullTerminatedLatin1String(uint8Array, offsetM, length);
        const [description, offsetD] = readNullTerminatedLatin1String(uint8Array, offsetF, length);

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
    let values: string[];
    if (this.major < 4) {
      values = text.split(/\0/g);
      if (values.length > 1) {
        this.warningCollector.addWarning(`ID3v2.${this.major} ${tag} uses non standard null-separator.`);
      } else {
        values = text.split(/\//g);
      }
    } else {
      values = text.split(/\0/g);
    }
    return trimArray(values);
  }
}

/**
 *
 * @param origVal
 * @returns
 */
export const parseGenre = (origVal: string): string[] => {
  // match everything inside parentheses
  const genres = [];
  let code: string;
  let word = "";
  for (const c of origVal) {
    if (typeof code === "string") {
      if (c === "(" && code === "") {
        word += "(";
        code = undefined;
      } else if (c === ")") {
        if (word !== "") {
          genres.push(word);
          word = "";
        }
        const genre = parseGenreCode(code);
        if (genre) {
          genres.push(genre);
        }
        code = undefined;
      } else code += c;
    } else if (c === "(") {
      code = "";
    } else {
      word += c;
    }
  }
  if (word) {
    if (genres.length === 0 && /^\d*$/.test(word)) {
      word = Genres[Number.parseInt(word, 10)];
    }
    genres.push(word);
  }
  return genres;
};

/**
 *
 * @param code
 * @returns
 */
const parseGenreCode = (code: string): string => {
  if (code === "RX") return "Remix";
  if (code === "CR") return "Cover";
  if (/^\d*$/.test(code)) {
    return Genres[Number.parseInt(code, 10)];
  }
};

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

/**
 * Converts TMCL (Musician credits list) or TIPL (Involved people list)
 * @param entries
 * @returns
 */
const functionList = (entries: string[]): Record<string, string[]> => {
  const res: Record<string, string[]> = {};
  for (let i = 0; i + 1 < entries.length; i += 2) {
    const names: string[] = entries[i + 1].split(",");
    res[entries[i]] = Object.prototype.hasOwnProperty.call(res, entries[i]) ? [...res[entries[i]], ...names] : names;
  }
  return res;
};

const trimArray = (values: string[]): string[] => {
  return values.map((value) => value.replace(/\0+$/, "").trim());
};

const readIdentifierAndData = (
  uint8Array: Uint8Array,
  offset: number,
  length: number,
  encoding: StringEncoding
): { id: string; data: Uint8Array } => {
  const [id, offsetI] = readNullTerminatedString(uint8Array, offset, length, encoding);

  return { id, data: uint8Array.slice(offsetI, length) };
};

const getNullTerminatorLength = (enc: StringEncoding): number => {
  return enc === "utf16le" ? 2 : 1;
};

const readNullTerminatedLatin1String = (
  buffer: Uint8Array,
  offset: number,
  length: number
): [text: string, offset: number] => {
  return readNullTerminatedString(buffer, offset, length, defaultEnc);
};

const readNullTerminatedString = (
  buffer: Uint8Array,
  offset: number,
  length: number,
  encoding: StringEncoding
): [text: string, offset: number] => {
  const fzero = findZeroByEncode(buffer, offset, length, encoding);
  const text = decodeString(buffer.slice(offset, fzero), encoding);
  return [text, fzero + getNullTerminatorLength(encoding)];
};
