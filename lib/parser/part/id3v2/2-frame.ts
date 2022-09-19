import { readBuffer } from "../../base/buffer";
import { readLatin1String } from "../../base/string";
import { readUint24be } from "../../base/unsigned-integer";

import { parseFrameData } from "./frame-data";

/**
 * ID3v2 frame
 */
export interface Id3v22FrameBase {
  id: string;
  length: number;
  value: unknown;
}

type Alphabet =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

interface Id3v22TextFrame extends Id3v22FrameBase {
  id: Exclude<`T${Alphabet}${Alphabet}`, "TXX">;
  value: string;
}

type Id3v22KnownFrame = Id3v22TextFrame;

interface Id3v22UnknownFrame extends Id3v22FrameBase {
  id: Exclude<`${Alphabet}${Alphabet}${Alphabet}`, Id3v22KnownFrame["id"]>;
  value: unknown;
}

type Id3v22Frame = Id3v22KnownFrame | Id3v22UnknownFrame;

/**
 * ID3v2.2 frame
 * Ref: http://id3.org/id3v2.3.0#ID3v2_header
 * ToDo
 * @param buffer
 * @param offset
 * @returns
 */
export const readId3v22Frame = (buffer: Uint8Array, offset: number): Id3v22Frame => {
  const id = readLatin1String(buffer, offset, 3);
  const length = readUint24be(buffer, offset + 3);

  return { id, length, value: parseFrameData(2, id, readBuffer(buffer, offset + 6, length)) };
};
