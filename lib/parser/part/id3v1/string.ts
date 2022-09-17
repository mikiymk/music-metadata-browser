import { trimRightNull } from "../../../common/Util";
import { type Result, isSuccess } from "../../../result/result";
import { readLatin1String } from "../../base/string";

export const readId3v1String = (buffer: Uint8Array, offset: number, length: number): Result<string, RangeError> => {
  const result = readLatin1String(buffer, offset, length);
  if (!isSuccess(result)) return result;
  return trimRightNull(result).trim();
};
