import type { TokenReader } from "../token";

/**
 * uint8array buffer
 * @param length
 * @returns uint8array
 */
export const bytes = (length: number): TokenReader<Uint8Array> => [
  length,
  (buffer, offset) => buffer.subarray(offset, offset + length),
];
