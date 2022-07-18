import type { ITokenizer } from "../../strtok3";

/**
 * read uint8array buffer
 * @param tokenizer
 * @param length
 * @returns 8 bit signed integer
 */
export const parseBuffer = async (tokenizer: ITokenizer, length: number): Promise<Uint8Array> => {
  const buffer = new Uint8Array(length);
  await tokenizer.readBuffer(buffer, { length });
  return buffer;
};
