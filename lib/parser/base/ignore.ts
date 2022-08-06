import type { ByteReader } from "../../byte-reader/byte-reader";

/**
 * read skip
 * @param tokenizer
 * @param byteLength
 */
export const parseSeek = async (tokenizer: ByteReader, byteLength: number): Promise<void> => {
  await tokenizer.read(byteLength);
  return;
};
