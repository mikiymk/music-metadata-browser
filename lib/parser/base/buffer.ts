import type { ByteReader } from "../../byte-reader/byte-reader";

/**
 * read uint8array buffer
 * @param tokenizer
 * @param byteLength
 * @returns uint8array
 */
export const parseUint8Array = (tokenizer: ByteReader, byteLength: number): Promise<Uint8Array> => {
  return tokenizer.read(byteLength);
};
