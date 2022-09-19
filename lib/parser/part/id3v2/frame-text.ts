import { isSuccess, Result } from "../../../result/result";
import { readUint8 } from "../../base/unsigned-integer";

import { functionList, parseGenre, splitValue } from "./frame-utils";
import { readId3v2String } from "./string";

interface readFrameText {
  (type: "TMCL" | "TIPL" | "IPLS", buffer: Uint8Array): Result<Record<string, string[]>, RangeError>;
  (type: "TRK" | "TRCK" | "TPOS", buffer: Uint8Array): Result<string, RangeError>;
  (type: "PCS" | "PCST", buffer: Uint8Array): Result<1 | 0, RangeError>;
  (type: string, buffer: Uint8Array): Result<string[], RangeError>;
}

export const readFrameText: readFrameText = ((type: string, buffer: Uint8Array) => {
  const encoding = readUint8(buffer, 0);
  if (!isSuccess(encoding)) return encoding;

  const text = readId3v2String(encoding)(buffer, 1, buffer.byteLength - 1);
  if (!isSuccess(text)) return text;

  switch (type) {
    case "TMCL": // Musician credits list
    case "TIPL": // Involved people list
    case "IPLS": // Involved people list
      return functionList(splitValue(text));

    case "TRK": // Track number/Position in set
    case "TRCK":
    case "TPOS":
      return text;

    case "TCO": // Content type
    case "TCON":
      return splitValue(text).flatMap((v) => parseGenre(v));

    case "PCS":
    case "PCST":
      // TODO: Why `default` not results `1` but `''`?
      return splitValue(text)[0] === "" ? 1 : 0;

    default:
      // id3v2.3 defines that TCOM, TEXT, TOLY, TOPE & TPE1 values are separated by /
      return splitValue(text);
  }
}) as readFrameText;
