import type { ByteReader } from "../../byte-reader/byte-reader";

/**
 * read 8 bit unsigned integer
 * @param reader
 * @returns 8 bit unsigned integer
 */
export const parseUnsignedInt8 = async (reader: ByteReader) => {
  const buffer = await reader.read(1);

  return buffer[0];
};

/**
 * read 16 bit unsigned integer little endian
 * @param reader
 * @returns 16 bit unsigned integer little endian
 */
export const parseUnsignedInt16LittleEndian = async (reader: ByteReader) => {
  const buffer = await reader.read(2);
  const view = new DataView(buffer.buffer);

  return view.getUint16(0, true);
};

/**
 * read 16 bit unsigned integer big endian
 * @param reader
 * @returns 16 bit unsigned integer big endian
 */
export const parseUnsignedInt16BigEndian = async (reader: ByteReader) => {
  const buffer = await reader.read(2);
  const view = new DataView(buffer.buffer);

  return view.getUint16(0);
};

/**
 * read 24 bit unsigned integer little endian
 * @param reader
 * @returns 24 bit unsigned integer little endian
 */
export const parseUnsignedInt24LittleEndian = async (reader: ByteReader) => {
  const buffer = await reader.read(3);
  const view = new DataView(buffer.buffer);

  return view.getUint8(0) + (view.getUint16(1, true) << 8);
};

/**
 * read 24 bit unsigned integer big endian
 * @param reader
 * @returns 24 bit unsigned integer big endian
 */
export const parseUnsignedInt24BigEndian = async (reader: ByteReader) => {
  const buffer = await reader.read(3);
  const view = new DataView(buffer.buffer);

  return (view.getUint16(0) << 8) + view.getUint8(2);
};

/**
 * read 32 bit unsigned integer little endian
 * @param reader
 * @returns 32 bit unsigned integer little endian
 */
export const parseUnsignedInt32LittleEndian = async (reader: ByteReader) => {
  const buffer = await reader.read(4);
  const view = new DataView(buffer.buffer);

  return view.getUint32(0, true);
};

/**
 * read 32 bit unsigned integer big endian
 * @param reader
 * @returns 32 bit unsigned integer big endian
 */
export const parseUnsignedInt32BigEndian = async (reader: ByteReader) => {
  const buffer = await reader.read(4);
  const view = new DataView(buffer.buffer);

  return view.getUint32(0);
};

/**
 * read 64 bit unsigned integer little endian
 * @param reader
 * @returns 64 bit unsigned integer little endian
 */
export const parseUnsignedInt64LittleEndian = async (reader: ByteReader) => {
  const buffer = await reader.read(8);
  const view = new DataView(buffer.buffer);

  return view.getBigUint64(0, true);
};

/**
 * read 64 bit unsigned integer big endian
 * @param reader
 * @returns 64 bit unsigned integer big endian
 */
export const parseUnsignedInt64BigEndian = async (reader: ByteReader) => {
  const buffer = await reader.read(8);
  const view = new DataView(buffer.buffer);

  return view.getBigUint64(0);
};
