import { sequenceMap } from "../combinate/sequence-map";
import { u16be, u24be, u32be, u8 } from "../primitive/integer";
import { skip } from "../primitive/skip";
import { val } from "../primitive/value";

import type { Unit } from "../type/unit";

export const matroskaUint = (length: number): Unit<number, RangeError> => {
  const nrLen = Math.min(6, length); // JavaScript can max read 6 bytes integer
  return sequenceMap(skip(length - nrLen), uLengthBe(nrLen), (_, value) => value);
};

const u40be: Unit<number, RangeError> = sequenceMap(u32be, u8, (msb, lsb) => {
  return msb * 2 ** 8 + lsb;
});

const u48be: Unit<number, RangeError> = sequenceMap(u32be, u16be, (msb, lsb) => {
  return msb * 2 ** 16 + lsb;
});

/**
 * read unsigned number from array
 * @param length bytes length
 * @returns read number
 */
const uLengthBe = (length: number): Unit<number, RangeError> => {
  const unit = { 1: u8, 2: u16be, 3: u24be, 4: u32be, 5: u40be, 6: u48be }[length];

  return unit ?? val(new RangeError("length must be 1-6"));
};
