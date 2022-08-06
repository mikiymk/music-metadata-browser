import type { ByteReader } from "../../byte-reader/byte-reader";
import { decodeLatin1, decodeUtf16le, decodeUtf8 } from "../../compat/text-decoder";

/**
 * read Latin1 (ISO-8859-1) string
 * @param tokenizer
 * @param byteLength
 * @returns decoded string
 */
export const parseLatin1String = async (tokenizer: ByteReader, byteLength: number): Promise<string> => {
  const buffer = await tokenizer.read(byteLength);
  return decodeLatin1(buffer);
};

/**
 * read UTF-8 string
 * @param tokenizer
 * @param byteLength
 * @returns decoded string
 */
export const parseUtf8String = async (tokenizer: ByteReader, byteLength: number): Promise<string> => {
  const buffer = await tokenizer.read(byteLength);
  return decodeUtf8(buffer);
};

/**
 * read UTF-16 Little Endian (start with 0xff 0xfe) string
 * @param tokenizer
 * @param byteLength
 * @returns decoded string
 */
export const parseUtf16leString = async (tokenizer: ByteReader, byteLength: number): Promise<string> => {
  const buffer = await tokenizer.read(byteLength);
  return decodeUtf16le(buffer);
};
