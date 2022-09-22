import { decodeLatin1, decodeUtf16be, decodeUtf16le, decodeUtf8 } from "../../compat/text-decoder";

import { u16be } from "./unsigned-integer";

import type { TokenReader } from "../token";

/**
 * Latin1 (ISO-8859-1) string parser
 * @param length string byte length
 * @returns parser
 */
export const latin1 = (length: number): TokenReader<string> => [
  length,
  (buffer, offset) => decodeLatin1(buffer.subarray(offset, offset + length)),
];

/**
 * UTF-8 string parser
 * @param length string byte length
 * @returns parser
 */
export const utf8 = (length: number): TokenReader<string> => [
  length,
  (buffer, offset) => decodeUtf8(buffer.subarray(offset, offset + length)),
];

/**
 * UTF-16 (Little Endian) string parser
 * @param length string byte length
 * @returns parser
 */
export const utf16le = (length: number): TokenReader<string> => [
  length,
  (buffer, offset) => decodeUtf16le(buffer.subarray(offset, offset + length)),
];

/**
 * UTF-16 (Big Endian) string parser
 * @param length string byte length
 * @returns parser
 */
export const utf16be = (length: number): TokenReader<string> => [
  length,
  (buffer, offset) => decodeUtf16be(buffer.subarray(offset, offset + length)),
];

/**
 * UTF-16 (with Byte Order Mark) string parser
 * @param length string byte length
 * @returns parser
 */
export const utf16 = (length: number): TokenReader<string> => [
  length,
  (buffer, offset) => {
    let lastBomIndex = 0;
    for (let i = 0; i < length / 2; i++) {
      const mbyte = buffer[i * 2 + offset];
      const lbyte = buffer[i * 2 + offset + 1];
      if ((mbyte !== 0xff || lbyte !== 0xfe) && (mbyte !== 0xfe || lbyte !== 0xff)) {
        lastBomIndex = i * 2;
        break;
      }
    }

    const bom = u16be[1](buffer, offset + lastBomIndex - 2);

    if (bom === 0xff_fe) return decodeUtf16le(buffer.subarray(offset, offset + length));
    return decodeUtf16be(buffer.subarray(offset, offset + length));
  },
];
