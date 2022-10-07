import { map } from "../combinate/map";
import { bytes } from "../primitive/bytes";

import type { Unit } from "../type/unit";

/**
 * 28 bits (representing up to 256MB) integer, the msb is 0 to avoid 'false syncsignals'.
 * 4 * %0xxxxxxx
 */
export const u32beSyncsafe: Unit<number, RangeError> = map(bytes(4), (value) => {
  return value.reduce((num, byte) => (num << 7) | (byte & 0b0111_1111), 0);
});
