import type { ITokenizer } from "../../strtok3";

const arrayBuffer = new ArrayBuffer(8);
const bufferWriter = new Uint8Array(arrayBuffer);
const bufferView = new DataView(arrayBuffer);

/**
 * read 16 bit (half precision) floating point number big endian
 * @param tokenizer
 * @returns float
 */
export const parseFloat16BigEndian = async (tokenizer: ITokenizer): Promise<number> => {
  const buffer = new Uint8Array(2);
  await tokenizer.readBuffer(buffer, { length: 2 });

  return readFloat16(buffer);
};

/**
 * read 16 bit (half precision) floating point number little endian
 * @param tokenizer
 * @returns float
 */
export const parseFloat16LittleEndian = async (tokenizer: ITokenizer): Promise<number> => {
  const buffer = new Uint8Array(2);
  await tokenizer.readBuffer(buffer, { length: 2 });

  return readFloat16(buffer, true);
};

/**
 * read 32 bit (single precision) floating point number big endian
 * @param tokenizer
 * @returns float
 */
export const parseFloat32BigEndian = async (tokenizer: ITokenizer): Promise<number> => {
  await tokenizer.readBuffer(bufferWriter, { length: 4 });
  return bufferView.getFloat32(0);
};

/**
 * read 32 bit (single precision) floating point number little endian
 * @param tokenizer
 * @returns float
 */
export const parseFloat32LittleEndian = async (tokenizer: ITokenizer): Promise<number> => {
  await tokenizer.readBuffer(bufferWriter, { length: 4 });
  return bufferView.getFloat32(0, true);
};

/**
 * read 64 bit (single precision) floating point number big endian
 * @param tokenizer
 * @returns float
 */
export const parseFloat64BigEndian = async (tokenizer: ITokenizer): Promise<number> => {
  await tokenizer.readBuffer(bufferWriter, { length: 8 });
  return bufferView.getFloat64(0);
};

/**
 * read 64 bit (single precision) floating point number little endian
 * @param tokenizer
 * @returns float
 */
export const parseFloat64LittleEndian = async (tokenizer: ITokenizer): Promise<number> => {
  await tokenizer.readBuffer(bufferWriter, { length: 8 });
  return bufferView.getFloat64(0, true);
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

const readFloat32 = (buffer: Uint8Array, littleEndian?: boolean) => {
  /*
   * seee_eeee efff_ffff ffff_ffff ffff_ffff
   * e: 8, f: 23
   * s * (2 ** e - 0111_1111) * 1.ffffffffff
   * s * (2 ** e - 0111_1111) * 0.ffffffffff (e == 0000_0000 = 0)
   * s * Infinity                            (e == 1111_1111 = 255, f == 0)
   * NaN                                     (e == 1111_1111 = 255, f != 0)
   */

  const osb = buffer[littleEndian ? 3 : 0];
  const nsb = buffer[littleEndian ? 2 : 1];
  const msb = buffer[littleEndian ? 1 : 2];
  const lsb = buffer[littleEndian ? 0 : 3];

  const sign = osb >> 7 ? -1 : 1;
  const exponent = ((osb & 0b0111_1111) << 1) + ((nsb & 0b1000_0000) >> 7);
  const significand = ((nsb & 0b0111_1111) << 16) + (msb << 8) + lsb;

  return buildFloat(sign, exponent, significand, 0b1111_1111, 23);
};

const readFloat64 = (buffer: Uint8Array, littleEndian?: boolean) => {
  /*
   * seee_eeee eeee_ffff ffff_ffff ffff_ffff ffff_ffff ffff_ffff ffff_ffff ffff_ffff
   * e: 11, f: 52
   * s * (2 ** e - 011 1111_1111) * 1.ffffffffff
   * s * (2 ** e - 011 1111_1111) * 0.ffffffffff (e == 000 0000_0000 = 0)
   * s * Infinity                                (e == 111 1111_1111 = 2047, f == 0)
   * NaN                                         (e == 111 1111_1111 = 2047, f != 0)
   */

  const ssb = buffer[littleEndian ? 7 : 0];
  const rsb = buffer[littleEndian ? 6 : 1];
  const qsb = buffer[littleEndian ? 5 : 2];
  const psb = buffer[littleEndian ? 4 : 3];
  const osb = buffer[littleEndian ? 3 : 4];
  const nsb = buffer[littleEndian ? 2 : 5];
  const msb = buffer[littleEndian ? 1 : 6];
  const lsb = buffer[littleEndian ? 0 : 7];

  const sign = ssb >> 7 ? -1 : 1;
  const exponent = ((ssb & 0b0111_1111) << 4) + ((rsb & 0b1111_0000) >> 5);
  const significand =
    (rsb & 0b1111) * 2 ** 48 + qsb * 2 ** 40 + psb * 2 ** 32 + osb * 2 ** 24 + nsb * 2 ** 16 + msb * 2 ** 8 + lsb;

  return buildFloat(sign, exponent, significand, 0b111_1111_1111, 52);
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
