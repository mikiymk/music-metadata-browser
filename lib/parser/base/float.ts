import type { ByteReader } from "../../byte-reader/byte-reader";

/**
 * read 16 bit (half precision) floating point number big endian
 * @param tokenizer
 * @returns float
 */
export const parseFloat16BigEndian = async (tokenizer: ByteReader): Promise<number> => {
  const buffer = await tokenizer.read(2);

  return readFloat16(buffer);
};

/**
 * read 16 bit (half precision) floating point number little endian
 * @param tokenizer
 * @returns float
 */
export const parseFloat16LittleEndian = async (tokenizer: ByteReader): Promise<number> => {
  const buffer = await tokenizer.read(2);

  return readFloat16(buffer, true);
};

/**
 * read 32 bit (single precision) floating point number big endian
 * @param tokenizer
 * @returns float
 */
export const parseFloat32BigEndian = async (tokenizer: ByteReader): Promise<number> => {
  const buffer = await tokenizer.read(4);
  const view = new DataView(buffer.buffer);

  return view.getFloat32(0);
};

/**
 * read 32 bit (single precision) floating point number little endian
 * @param tokenizer
 * @returns float
 */
export const parseFloat32LittleEndian = async (tokenizer: ByteReader): Promise<number> => {
  const buffer = await tokenizer.read(4);
  const view = new DataView(buffer.buffer);

  return view.getFloat32(0, true);
};

/**
 * read 64 bit (single precision) floating point number big endian
 * @param tokenizer
 * @returns float
 */
export const parseFloat64BigEndian = async (tokenizer: ByteReader): Promise<number> => {
  const buffer = await tokenizer.read(8);
  const view = new DataView(buffer.buffer);
  return view.getFloat64(0);
};

/**
 * read 64 bit (single precision) floating point number little endian
 * @param tokenizer
 * @returns float
 */
export const parseFloat64LittleEndian = async (tokenizer: ByteReader): Promise<number> => {
  const buffer = await tokenizer.read(8);
  const view = new DataView(buffer.buffer);
  return view.getFloat64(0, true);
};

// read functions

const readFloat16 = (buffer: Uint8Array, littleEndian?: boolean) => {
  /*
   * seee_eeff ffff_ffff
   * e: 5, f: 10
   * s * (2 ** e_eeee - 01111) * 1.ffffffffff
   * s * (2 ** e_eeee - 01111) * 0.ffffffffff (e == 0_0000 = 0)
   * s * Infinity                             (e == 1_1111 = 31, f == 0)
   * NaN                                      (e == 1_1111 = 31, f != 0)
   */

  const msb = buffer[littleEndian ? 1 : 0];
  const lsb = buffer[littleEndian ? 0 : 1];

  const sign = msb >> 7 ? -1 : 1;
  const exponent = (msb & 0b0111_1100) >> 2;
  const significand = ((msb & 0b0011) << 8) + lsb;

  return buildFloat(sign, exponent, significand, 0b1_1111, 10);
};
const buildFloat = (
  sign: 1 | -1,
  exponent: number,
  significand: number,
  exponentMax: number,
  significandLength: number
) => {
  const exponentBias = exponentMax >> 1;
  return exponent === 0
    ? sign * significand * Math.pow(2, 1 - exponentBias - significandLength)
    : exponent === exponentMax
    ? significand
      ? Number.NaN
      : sign * Number.POSITIVE_INFINITY
    : sign * (significand + Math.pow(2, significandLength)) * Math.pow(2, exponent - exponentBias - significandLength);
};
