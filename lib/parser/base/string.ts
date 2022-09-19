import { decodeLatin1, decodeUtf16be, decodeUtf16le, decodeUtf8 } from "../../compat/text-decoder";
import { assertLength } from "../../errors/range-error";
import { isSuccess, type Result } from "../../result/result";

import { readUint16be } from "./unsigned-integer";

/**
 * read Latin1 (ISO-8859-1) string
 * @param buffer
 * @param offset
 * @param length
 * @returns decoded string
 */
export const readLatin1String = (
  buffer: Uint8Array,
  offset = 0,
  length = buffer.byteLength - offset
): Result<string, RangeError> => {
  const result = assertLength(buffer, offset + length);
  if (result) return result;
  return decodeLatin1(buffer.subarray(offset, offset + length));
};

/**
 * read UTF-8 string
 * @param buffer
 * @param offset
 * @param length
 * @returns decoded string
 */
export const readUtf8String = (
  buffer: Uint8Array,
  offset = 0,
  length = buffer.byteLength - offset
): Result<string, RangeError> => {
  const result = assertLength(buffer, offset + length);
  if (result) return result;
  return decodeUtf8(buffer.subarray(offset, offset + length));
};

/**
 * read UTF-16 Little Endian (start with 0xff 0xfe) string
 * @param buffer
 * @param offset
 * @param length
 * @returns decoded string
 */
export const readUtf16leString = (
  buffer: Uint8Array,
  offset = 0,
  length = buffer.byteLength - offset
): Result<string, RangeError> => {
  const result = assertLength(buffer, offset + length);
  if (result) return result;
  return decodeUtf16le(buffer.subarray(offset, offset + length));
};

/**
 * read UTF-16 Big Endian (start with 0xfe 0xff) string
 * @param buffer
 * @param offset
 * @param length
 * @returns decoded string
 */
export const readUtf16beString = (
  buffer: Uint8Array,
  offset = 0,
  length = buffer.byteLength - offset
): Result<string, RangeError> => {
  const result = assertLength(buffer, offset + length);
  if (result) return result;
  return decodeUtf16be(buffer.subarray(offset, offset + length));
};

/**
 * read UTF-16 with Byte Order Mark (start with 0xff 0xfe or 0xfe 0xff) string
 * @param buffer
 * @param offset
 * @param length
 * @returns decoded string
 */
export const readUtf16bomString = (
  buffer: Uint8Array,
  offset = 0,
  length = buffer.byteLength - offset
): Result<string, RangeError> => {
  const result = assertLength(buffer, offset + length);
  if (result) return result;

  let lastBomIndex = 0;
  for (let i = 0; i < length / 2; i++) {
    const mbyte = buffer[i * 2 + offset];
    const lbyte = buffer[i * 2 + offset + 1];
    if ((mbyte !== 0xff || lbyte !== 0xfe) && (mbyte !== 0xfe || lbyte !== 0xff)) {
      lastBomIndex = i * 2;
      break;
    }
  }

  const bom = readUint16be(buffer, offset + lastBomIndex - 2);
  if (!isSuccess(bom)) return bom;

  if (bom === 0xff_fe) return decodeUtf16le(buffer.subarray(offset, offset + length));
  return decodeUtf16be(buffer.subarray(offset, offset + length));
};
