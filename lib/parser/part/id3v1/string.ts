import { trimNulls } from "../../../common/Util";
import { readLatin1String } from "../../base/string";

export const readId3v1String = (buffer: Uint8Array, offset: number, length: number): string => {
  return trimNulls(readLatin1String(buffer, offset, length));
};
