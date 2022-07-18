import type { ITokenizer } from "../../strtok3";
import { parseUnsignedInt24BigEndian, parseUnsignedInt24LittleEndian } from "./unsigned-integer";

const arrayBuffer = new ArrayBuffer(8);
const buffer = new Uint8Array(arrayBuffer);
const view = new DataView(arrayBuffer);

/**
 * read 8 bit signed integer
 * @param tokenizer
 * @returns 8 bit signed integer
 */
export const parseSignedInt8 = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 1 });

  return view.getInt8(0);
};

/**
 * read 16 bit signed integer little endian
 * @param tokenizer
 * @returns 16 bit signed integer little endian
 */
export const parseSignedInt16LittleEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 2 });

  return view.getInt16(0, true);
};

/**
 * read 16 bit signed integer big endian
 * @param tokenizer
 * @returns 16 bit signed integer big endian
 */
export const parseSignedInt16BigEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 2 });

  return view.getInt16(0);
};

/**
 * read 24 bit signed integer little endian
 * @param tokenizer
 * @returns 24 bit signed integer little endian
 */
export const parseSignedInt24LittleEndian = async (tokenizer: ITokenizer) => {
  const uint = await parseUnsignedInt24LittleEndian(tokenizer);

  return uint > 0x7f_ff_ff ? uint - 0x1_00_00_00 : uint;
};

/**
 * read 24 bit signed integer big endian
 * @param tokenizer
 * @returns 24 bit signed integer big endian
 */
export const parseSignedInt24BigEndian = async (tokenizer: ITokenizer) => {
  const uint = await parseUnsignedInt24BigEndian(tokenizer);

  return uint > 0x7f_ff_ff ? uint - 0x1_00_00_00 : uint;
};

/**
 * read 32 bit signed integer little endian
 * @param tokenizer
 * @returns 32 bit signed integer little endian
 */
export const parseSignedInt32LittleEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 4 });
  return view.getInt32(0, true);
};

/**
 * read 32 bit signed integer big endian
 * @param tokenizer
 * @returns 32 bit signed integer big endian
 */
export const parseSignedInt32BigEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 4 });
  return view.getInt32(0);
};

/**
 * read 64 bit signed integer little endian
 * @param tokenizer
 * @returns 64 bit signed integer little endian
 */
export const parseSignedInt64LittleEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 8 });
  return view.getBigInt64(0, true);
};

/**
 * read 64 bit signed integer big endian
 * @param tokenizer
 * @returns 64 bit signed integer big endian
 */
export const parseSignedInt64BigEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 8 });
  return view.getBigInt64(0);
};
