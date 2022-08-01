import type { ITokenizer } from "../../strtok3";

const arrayBuffer = new ArrayBuffer(8);
const buffer = new Uint8Array(arrayBuffer);
const view = new DataView(arrayBuffer);

/**
 * read 8 bit unsigned integer
 * @param tokenizer
 * @returns 8 bit unsigned integer
 */
export const parseUnsignedInt8 = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 1 });

  return view.getUint8(0);
};

/**
 * read 16 bit unsigned integer little endian
 * @param tokenizer
 * @returns 16 bit unsigned integer little endian
 */
export const parseUnsignedInt16LittleEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 2 });

  return view.getUint16(0, true);
};

/**
 * read 16 bit unsigned integer big endian
 * @param tokenizer
 * @returns 16 bit unsigned integer big endian
 */
export const parseUnsignedInt16BigEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 2 });

  return view.getUint16(0);
};

/**
 * read 24 bit unsigned integer little endian
 * @param tokenizer
 * @returns 24 bit unsigned integer little endian
 */
export const parseUnsignedInt24LittleEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 3 });

  return view.getUint8(0) + (view.getUint16(1, true) << 8);
};

/**
 * read 24 bit unsigned integer big endian
 * @param tokenizer
 * @returns 24 bit unsigned integer big endian
 */
export const parseUnsignedInt24BigEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 3 });

  return (view.getUint16(0) << 8) + view.getUint8(2);
};

/**
 * read 32 bit unsigned integer little endian
 * @param tokenizer
 * @returns 32 bit unsigned integer little endian
 */
export const parseUnsignedInt32LittleEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 4 });
  return view.getUint32(0, true);
};

/**
 * read 32 bit unsigned integer big endian
 * @param tokenizer
 * @returns 32 bit unsigned integer big endian
 */
export const parseUnsignedInt32BigEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 4 });
  return view.getUint32(0);
};

/**
 * read 64 bit unsigned integer little endian
 * @param tokenizer
 * @returns 64 bit unsigned integer little endian
 */
export const parseUnsignedInt64LittleEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 8 });
  return view.getBigUint64(0, true);
};

/**
 * read 64 bit unsigned integer big endian
 * @param tokenizer
 * @returns 64 bit unsigned integer big endian
 */
export const parseUnsignedInt64BigEndian = async (tokenizer: ITokenizer) => {
  await tokenizer.readBuffer(buffer, { length: 8 });
  return view.getBigUint64(0);
};
