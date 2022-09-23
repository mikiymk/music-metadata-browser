import { latin1, utf16, utf16be, utf8 } from "../../base/string";
import { u8 } from "../../base/unsigned-integer";
import { map, TokenReader } from "../../token";

export type Id3v2Encoding = 0b00 | 0b01 | 0b10 | 0b11;

export const id3v2Encoding: TokenReader<Id3v2Encoding> = map(u8, (val) => ([0, 1, 2, 3] as const)[val] ?? 3);

export const id3v2String = (encoding: Id3v2Encoding, length: number): TokenReader<string> => {
  return ([latin1, utf16be, utf16][encoding] ?? utf8)(length);
};
