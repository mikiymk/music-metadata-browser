import { trimRightNull } from "../../../common/Util";
import { readLatin1String } from "../../base/string";

export const readId3v1String = (buffer: Uint8Array, offset: number, length: number): string => {
  return trimRightNull(readLatin1String(buffer, offset, length)).trim();
};
