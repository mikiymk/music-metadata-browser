import { BufferByteReader } from "./buffer-byte-reader";

export type ByteReader = {
  /**
   * bytes (uint8) data read and position advance
   * @param length read data byte length
   * @returns read data
   */
  read(length: number): Promise<Uint8Array>;

  /**
   * bytes (uint8) data read and position no advance
   * @param length read data byte length
   * @returns read data
   */
  peek(length: number): Promise<Uint8Array>;

  /**
   * get rest bytes (uint8) data length
   * @returns data length
   */
  restLength(): number;
};

export const peekReader = async (reader: ByteReader, length: number) => {
  const buffer = await reader.peek(length);

  return new BufferByteReader(buffer);
};
