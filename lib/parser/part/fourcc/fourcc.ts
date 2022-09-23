import { readLatin1String } from "../../base/string";

/*
 * Token for read FourCC
 * Ref: https://en.wikipedia.org/wiki/FourCC
 */

const validFourCC = /^[\u0021-\u007E©][\0\u0020-\u007E]{3}/;

export const FOUR_CC_TOKEN_SIZE = 4;

export const readFourCcToken = (buffer: Uint8Array, offset: number): string => {
  const id = readLatin1String(buffer, offset, 4);
  if (!validFourCC.test(id)) throw new Error(`FourCC contains invalid characters: "${id}"`);
  return id;
};
