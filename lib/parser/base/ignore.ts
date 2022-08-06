import type { ITokenizer } from "../../strtok3";

/**
 * read skip
 * @param tokenizer
 * @param byteLength
 */
export const parseSeek = async (tokenizer: ITokenizer, byteLength: number): Promise<void> => {
  const buffer = new Uint8Array(byteLength);
  await tokenizer.readBuffer(buffer, { length: byteLength });
  return;
};
