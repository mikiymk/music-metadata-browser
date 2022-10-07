import { sequenceMap } from "../combinate/sequence-map";
import { u16be, u32be } from "../primitive/integer";
import { skip } from "../primitive/skip";
import { readUnitFromBuffer } from "../utility/read-unit";

import type { Unit } from "../type/unit";

const getFloat80 = (buffer: Uint8Array, offset: number): number => {
  /*
   * seee_eeee eeee_eeee ffff_ffff ffff_ffff ffff_ffff ffff_ffff ffff_ffff ffff_ffff ffff_ffff ffff_ffff
   * e: 15, f: 64 big endian
   * s * (2 ** e_eeee - 01111) * f.ffffffffff
   * s * Infinity                             (e == 1_1111 = 31, f == 0)
   * NaN                                      (e == 1_1111 = 31, f != 0)
   */

  const u16 = readUnitFromBuffer(u16be, buffer, offset);
  const significantM = readUnitFromBuffer(u32be, buffer, offset + 2);
  const significantL = readUnitFromBuffer(u32be, buffer, offset + 6);

  const sign = u16 >> 15 ? -1 : 1;
  const exponent = u16 & 0b0111_1111_1111_1111;

  if (exponent === 0x7f_ff) {
    return significantM || significantL ? Number.NaN : sign * Number.POSITIVE_INFINITY;
  }
  return sign * (significantM * 2 ** 32 + significantL) * 2 ** (exponent - 0x3f_ff - 63);
};

export const f80: Unit<number, RangeError> = [10, getFloat80];
export const f80Alt: Unit<number, RangeError> = sequenceMap(u16be, u16be, skip(6), (shift, base) => {
  shift -= 16_398;
  return shift < 0 ? base >> Math.abs(shift) : base << shift;
});
