import type { ByteReader } from "../../byte-reader/byte-reader";
import { parseUnsignedInt24BigEndian, parseUnsignedInt24LittleEndian } from "./unsigned-integer";

/**
 * read 8 bit signed integer
 * @param tokenizer
 * @returns 8 bit signed integer
 */
export const parseSignedInt8 = async (tokenizer: ByteReader) => {
  const buffer = await tokenizer.read(1);
  const view = new DataView(buffer.buffer);

  return view.getInt8(0);
};

/**
 * read 16 bit signed integer little endian
 * @param tokenizer
 * @returns 16 bit signed integer little endian
 */
export const parseSignedInt16LittleEndian = async (tokenizer: ByteReader) => {
  const buffer = await tokenizer.read(2);
  const view = new DataView(buffer.buffer);

  return view.getInt16(0, true);
};

/**
 * read 16 bit signed integer big endian
 * @param tokenizer
 * @returns 16 bit signed integer big endian
 */
export const parseSignedInt16BigEndian = async (tokenizer: ByteReader) => {
  const buffer = await tokenizer.read(2);
  const view = new DataView(buffer.buffer);

  return view.getInt16(0);
};

/**
 * read 24 bit signed integer little endian
 * @param tokenizer
 * @returns 24 bit signed integer little endian
 */
export const parseSignedInt24LittleEndian = async (tokenizer: ByteReader) => {
  const uint = await parseUnsignedInt24LittleEndian(tokenizer);

  return uint > 0x7f_ff_ff ? uint - 0x1_00_00_00 : uint;
};

/**
 * read 24 bit signed integer big endian
 * @param tokenizer
 * @returns 24 bit signed integer big endian
 */
export const parseSignedInt24BigEndian = async (tokenizer: ByteReader) => {
  const uint = await parseUnsignedInt24BigEndian(tokenizer);

  return uint > 0x7f_ff_ff ? uint - 0x1_00_00_00 : uint;
};

/**
 * read 32 bit signed integer little endian
 * @param tokenizer
 * @returns 32 bit signed integer little endian
 */
export const parseSignedInt32LittleEndian = async (tokenizer: ByteReader) => {
  const buffer = await tokenizer.read(4);
  const view = new DataView(buffer.buffer);

  return view.getInt32(0, true);
};

/**
 * read 32 bit signed integer big endian
 * @param tokenizer
 * @returns 32 bit signed integer big endian
 */
export const parseSignedInt32BigEndian = async (tokenizer: ByteReader) => {
  const buffer = await tokenizer.read(4);
  const view = new DataView(buffer.buffer);

  return view.getInt32(0);
};

/**
 * read 64 bit signed integer little endian
 * @param tokenizer
 * @returns 64 bit signed integer little endian
 */
export const parseSignedInt64LittleEndian = async (tokenizer: ByteReader) => {
  const buffer = await tokenizer.read(8);
  const view = new DataView(buffer.buffer);

  return view.getBigInt64(0, true);
};

/**
 * read 64 bit signed integer big endian
 * @param tokenizer
 * @returns 64 bit signed integer big endian
 */
export const parseSignedInt64BigEndian = async (tokenizer: ByteReader) => {
  const buffer = await tokenizer.read(8);
  const view = new DataView(buffer.buffer);

  return view.getBigInt64(0);
};
