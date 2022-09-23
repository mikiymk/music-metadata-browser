import { bytes } from "../../base/buffer";
import { seqMap } from "../../token";

const bitMask = 0x7f;

/**
 * 28 bits (representing up to 256MB) integer, the msb is 0 to avoid 'false syncsignals'.
 * 4 * %0xxxxxxx
 * @param buffer
 * @param offset
 * @returns 32 bit unsigned integer big endian
 */
export const syncsafeU32be = seqMap((data) => data.reduce((prev, curr) => (prev << 7) | (curr & bitMask), 0), bytes(4));
