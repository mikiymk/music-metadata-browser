import { readLatin1String, readUtf16beString, readUtf16bomString, readUtf8String } from "../../base/string";

export const readId3v2String = (
  encoding: number
): ((buffer: Uint8Array, offset?: number, length?: number) => string) => {
  switch (encoding) {
    case 1:
      return readUtf16beString;
    case 2:
      return readUtf16bomString;
    case 3:
      return readUtf8String;
    default:
      return readLatin1String;
  }
};
