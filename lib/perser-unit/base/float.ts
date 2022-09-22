import { dataview } from "./util";

import type { TokenReader } from "../token";

export const f16le: TokenReader<number> = [2, (buffer, offset) => getFloat16(buffer, offset, true)];
export const f16be: TokenReader<number> = [2, (buffer, offset) => getFloat16(buffer, offset)];
export const f32le: TokenReader<number> = [4, (buffer, offset) => dataview(buffer).getFloat32(offset, true)];
export const f32be: TokenReader<number> = [4, (buffer, offset) => dataview(buffer).getFloat32(offset)];
export const f64le: TokenReader<number> = [8, (buffer, offset) => dataview(buffer).getFloat64(offset, true)];
export const f64be: TokenReader<number> = [8, (buffer, offset) => dataview(buffer).getFloat64(offset)];

// read functions

const getFloat16 = (buffer: Uint8Array, offset: number, littleEndian?: boolean): number => {
  /*
   * seee_eeff ffff_ffff
   * e: 5, f: 10
   * s * (2 ** e_eeee - 01111) * 1.ffffffffff
   * s * (2 ** e_eeee - 01111) * 0.ffffffffff (e == 0_0000 = 0)
   * s * Infinity                             (e == 1_1111 = 31, f == 0)
   * NaN                                      (e == 1_1111 = 31, f != 0)
   */

  const msb = buffer[(littleEndian ? 1 : 0) + offset];
  const lsb = buffer[(littleEndian ? 0 : 1) + offset];

  const sign = msb >> 7 ? -1 : 1;
  const exponent = (msb & 0b0111_1100) >> 2;
  const significant = ((msb & 0b0011) << 8) + lsb;

  if (exponent === 0) {
    return sign * significant * Math.pow(2, -24);
  }
  if (exponent === 31) {
    return significant ? Number.NaN : sign * Number.POSITIVE_INFINITY;
  }
  return sign * (significant + Math.pow(2, 10)) * Math.pow(2, exponent - 25);
};
