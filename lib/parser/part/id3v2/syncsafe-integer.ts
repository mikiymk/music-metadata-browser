import { assertLength } from "../../../errors/range-error";

import type { Result } from "../../../result/result";

export const SYNCSAFE_UINT32_SIZE = 4;
const bitMask = 0x7f;

/**
 * 28 bits (representing up to 256MB) integer, the msb is 0 to avoid 'false syncsignals'.
 * 4 * %0xxxxxxx
 * @param buffer
 * @param offset
 * @returns 32 bit unsigned integer big endian
 */
export const readSyncSafeUint32be = (buffer: Uint8Array, offset: number): Result<number, RangeError> => {
  const rangeError = assertLength(buffer, offset + SYNCSAFE_UINT32_SIZE);
  if (rangeError) return rangeError;
  return (
    ((buffer[offset] & bitMask) << 21) |
    ((buffer[offset + 1] & bitMask) << 14) |
    ((buffer[offset + 2] & bitMask) << 7) |
    (buffer[offset + 3] & bitMask)
  );
};
