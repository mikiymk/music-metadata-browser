import type { Result } from "../result/result";

export const assertLength = (buffer: Uint8Array, length: number): Result<false, RangeError> => {
  if (buffer.byteLength < length)
    return new RangeError(`${length} is outside the bounds of the Buffer { length: ${buffer.byteLength} }`);
  return false;
};
