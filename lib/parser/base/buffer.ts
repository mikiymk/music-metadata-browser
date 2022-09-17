import { assertLength } from "../../errors/range-error";

import type { Result } from "../../result/result";

/**
 * read uint8array buffer
 * @param buffer
 * @param offset
 * @param length
 * @returns uint8array
 */
export const readBuffer = (buffer: Uint8Array, offset: number, length: number): Result<Uint8Array, RangeError> => {
  const result = assertLength(buffer, offset + length);
  if (result) return result;
  return buffer.subarray(offset, offset + length);
};
