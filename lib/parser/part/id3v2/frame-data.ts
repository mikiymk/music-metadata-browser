import { isSuccess } from "../../../result/result";
import { readUint8 } from "../../base/unsigned-integer";

import { readFrameText } from "./frame-text";
import { readFrameUserDefinedText } from "./frame-userdefined-text";

import type { ID3v2MajorVersion } from "./header";

export const parseFrameData = (major: ID3v2MajorVersion, type: string, buffer: Uint8Array) => {
  const encoding = readUint8(buffer, 0);
  if (!isSuccess(encoding)) return encoding;

  const length = buffer.length;
  let offset = 0;
  let output: any = []; // ToDo
  const nullTerminatorLength = FrameParser.getNullTerminatorLength(encoding);
  let fzero: number;
  const out: IOut = {};

  switch (type !== "TXXX" && type !== "TXX" && type.startsWith("T") ? "T*" : type) {
    case "T*": // 4.2.1. Text information frames - details
    case "IPLS": // v2.3: Involved people list
    case "MVIN":
    case "MVNM":
    case "PCS":
    case "PCST":
      return readFrameText(type, buffer);

    case "TXX":
    case "TXXX":
      return readFrameUserDefinedText();

    case "PIC":
    case "APIC":
      if (includeCovers) {
        const pic: IPicture = {};

        offset += 1;

        switch (this.major) {
          case 2:
            pic.format = util.decodeString(buffer.slice(offset, offset + 3), "latin1"); // 'latin1'; // latin1 == iso-8859-1;
            offset += 3;
            break;
          case 3:
          case 4:
            fzero = util.findZero(buffer, offset, length, defaultEnc);
            pic.format = util.decodeString(buffer.slice(offset, fzero), defaultEnc);
            offset = fzero + 1;
            break;

          default:
            throw new Error(`Warning: unexpected major versionIndex: ${this.major}`);
        }

        pic.format = FrameParser.fixPictureMimeType(pic.format);

        pic.type = AttachedPictureType[buffer[offset]];
        offset += 1;

        fzero = util.findZero(buffer, offset, length, encoding);
        pic.description = util.decodeString(buffer.slice(offset, fzero), encoding);
        offset = fzero + nullTerminatorLength;

        pic.data = buffer.slice(offset, length);
        output = pic;
      }
      break;

    case "CNT":
    case "PCNT":
      output = UINT32_BE.get(buffer, 0);
      break;

    case "SYLT":
      // skip text encoding (1 byte),
      //      language (3 bytes),
      //      time stamp format (1 byte),
      //      content tagTypes (1 byte),
      //      content descriptor (1 byte)
      offset += 7;

      output = [];
      while (offset < length) {
        const txt = buffer.slice(offset, (offset = util.findZero(buffer, offset, length, encoding)));
        offset += 5; // push offset forward one +  4 byte timestamp
        output.push(util.decodeString(txt, encoding));
      }
      break;

    case "ULT":
    case "USLT":
    case "COM":
    case "COMM":
      offset += 1;

      out.language = util.decodeString(buffer.slice(offset, offset + 3), defaultEnc);
      offset += 3;

      fzero = util.findZero(buffer, offset, length, encoding);
      out.description = util.decodeString(buffer.slice(offset, fzero), encoding);
      offset = fzero + nullTerminatorLength;

      out.text = util.decodeString(buffer.slice(offset, length), encoding).replace(/\0+$/, "");

      output = [out];
      break;

    case "UFID":
      output = FrameParser.readIdentifierAndData(buffer, offset, length, defaultEnc);
      output = { owner_identifier: output.id, identifier: output.data };
      break;

    case "PRIV": // private frame
      output = FrameParser.readIdentifierAndData(buffer, offset, length, defaultEnc);
      output = { owner_identifier: output.id, data: output.data };
      break;

    case "POPM": {
      // Popularimeter
      fzero = util.findZero(buffer, offset, length, defaultEnc);
      const email = util.decodeString(buffer.slice(offset, fzero), defaultEnc);
      offset = fzero + 1;
      const dataLen = length - offset;
      output = {
        email,
        rating: UINT8.get(buffer, offset),
        counter: dataLen >= 5 ? UINT32_BE.get(buffer, offset + 1) : undefined,
      };
      break;
    }

    case "GEOB": {
      // General encapsulated object
      fzero = util.findZero(buffer, offset + 1, length, encoding);
      const mimeType = util.decodeString(buffer.slice(offset + 1, fzero), defaultEnc);
      offset = fzero + 1;
      fzero = util.findZero(buffer, offset, length - offset, encoding);
      const filename = util.decodeString(buffer.slice(offset, fzero), defaultEnc);
      offset = fzero + 1;
      fzero = util.findZero(buffer, offset, length - offset, encoding);
      const description = util.decodeString(buffer.slice(offset, fzero), defaultEnc);
      output = {
        type: mimeType,
        filename,
        description,
        data: buffer.slice(offset + 1, length),
      };
      break;
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
      output = util.decodeString(buffer.slice(offset, fzero), defaultEnc);
      break;

    case "WXXX": {
      // Decode URL
      fzero = util.findZero(buffer, offset + 1, length, encoding);
      const description = util.decodeString(buffer.slice(offset + 1, fzero), encoding);
      offset = fzero + (encoding === "utf16le" ? 2 : 1);
      output = {
        description,
        url: util.decodeString(buffer.slice(offset, length), defaultEnc),
      };
      break;
    }

    case "WFD":
    case "WFED":
      return util.decodeString(buffer.slice(offset + 1, util.findZero(buffer, offset + 1, length, encoding)), encoding);

    case "MCDI":
      // Music CD identifier
      return buffer.slice(0, length);

    default:
  }

  return output;
};
