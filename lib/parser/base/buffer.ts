import type { ITokenizer } from "../../strtok3";

/**
 * read uint8array buffer
 * @param tokenizer
 * @param byteLength
 * @returns uint8array
 */
export const parseBuffer = async (tokenizer: ITokenizer, byteLength: number): Promise<Uint8Array> => {
  const buffer = new Uint8Array(byteLength);
  await tokenizer.readBuffer(buffer, { length: byteLength });
  return buffer;
};
