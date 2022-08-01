import { decodeLatin1, decodeUtf16le, decodeUtf8 } from "../../compat/text-decoder";
import type { ITokenizer } from "../../strtok3";

/**
 * read Latin1 (ISO-8859-1) string
 * @param tokenizer
 * @param byteLength
 * @returns decoded string
 */
export const parseLatin1String = async (tokenizer: ITokenizer, byteLength: number): Promise<string> => {
  const buffer = new Uint8Array(byteLength);
  await tokenizer.readBuffer(buffer, { length: byteLength });
  return decodeLatin1(buffer);
};

/**
 * read UTF-8 string
 * @param tokenizer
 * @param byteLength
 * @returns decoded string
 */
export const parseUtf8String = async (tokenizer: ITokenizer, byteLength: number): Promise<string> => {
  const buffer = new Uint8Array(byteLength);
  await tokenizer.readBuffer(buffer, { length: byteLength });
  return decodeUtf8(buffer);
};

/**
 * read UTF-16 Little Endian (start with 0xff 0xfe) string
 * @param tokenizer
 * @param byteLength
 * @returns decoded string
 */
export const parseUtf16leString = async (tokenizer: ITokenizer, byteLength: number): Promise<string> => {
  const buffer = new Uint8Array(byteLength);
  await tokenizer.readBuffer(buffer, { length: byteLength });
  return decodeUtf16le(buffer);
};
