import { readUint8 } from "../../base/unsigned-integer";

import { readId3v2String } from "./string";
import { functionList, parseGenre, splitValue } from "./utils";

interface readFrameText {
  (type: "TMCL" | "TIPL" | "IPLS", buffer: Uint8Array): Record<string, string[]>;
  (type: "TRK" | "TRCK" | "TPOS", buffer: Uint8Array): string;
  (type: "PCS" | "PCST", buffer: Uint8Array): 1 | 0;
  (type: string, buffer: Uint8Array): string[];
}

export const readFrameText: readFrameText = ((type: string, buffer: Uint8Array) => {
  const encoding = readUint8(buffer, 0);

  const text = readId3v2String(encoding)(buffer, 1, buffer.byteLength - 1);

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
