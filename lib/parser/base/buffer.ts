import { assertLength } from "../../errors/range-error";

/**
 * read uint8array buffer
 * @param buffer
 * @param offset
 * @param length
 * @returns uint8array
 * @throws {RangeError} if buffer length < offset + length
 */
export const readBuffer = (buffer: Uint8Array, offset: number, length: number): Uint8Array => {
  assertLength(buffer, offset + length);
  return buffer.subarray(offset, offset + length);
};
