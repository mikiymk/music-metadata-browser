import { readLatin1String, readUtf16beString, readUtf16bomString, readUtf8String } from "../../base/string";
import { readUint8 } from "../../base/unsigned-integer";

export type Id3v2Encoding = 0b00 | 0b01 | 0b10 | 0b11;

export const ID3V2_ENCODING_SIZE = 1;

export const readId3v2Encoding = (buffer: Uint8Array, offset?: number): Id3v2Encoding => {
  return ([0, 1, 2, 3] as const)[readUint8(buffer, offset)] ?? 3;
};

export const readId3v2String = (
  encoding: Id3v2Encoding
): ((buffer: Uint8Array, offset?: number, length?: number) => string) => {
  switch (encoding) {
    case 0:
      return readLatin1String;
    case 1:
      return readUtf16beString;
    case 2:
      return readUtf16bomString;
    default:
      return readUtf8String;
  }
};
