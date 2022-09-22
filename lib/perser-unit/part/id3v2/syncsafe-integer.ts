import { assertLength } from "../../../errors/range-error";
import { readBuffer } from "../../base/buffer";

export const SYNCSAFE_UINT32_SIZE = 4;
const bitMask = 0x7f;

/**
 * 28 bits (representing up to 256MB) integer, the msb is 0 to avoid 'false syncsignals'.
 * 4 * %0xxxxxxx
 * @param buffer
 * @param offset
 * @returns 32 bit unsigned integer big endian
 */
export const readSyncSafeUint32be = (buffer: Uint8Array, offset: number): number => {
  assertLength(buffer, offset + SYNCSAFE_UINT32_SIZE);
  return readBuffer(buffer, offset, 4).reduce((prev, curr) => (prev << 7) | (curr & bitMask), 0);
};
