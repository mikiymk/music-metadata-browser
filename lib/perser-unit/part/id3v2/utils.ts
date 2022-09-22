import {
  decodeString,
  findZero,
  findZeroByEncode,
  findZeroZero,
  StringEncoding,
  trimNulls,
} from "../../../common/Util";
import { readBuffer } from "../../base/buffer";
import { Genres } from "../id3v1/genres";

import { readId3v2String } from "./string";

/**
 * id3v2.4 defines that multiple T* values are separated by 0x00
 * id3v2.3 defines that TCOM, TEXT, TOLY, TOPE & TPE1 values are separated by /
 * @param text - Concatenated tag value
 * @returns Split tag value
 */
export const splitValue = (text: string): string[] => {
  return text.split(/\0/g).map((s) => trimNulls(s));
};

/**
 *
 * @param origVal
 * @returns
 */
export const parseGenre = (origVal: string): string[] => {
  // match everything inside parentheses
  const genres = [];
  let code: string;
  let word = "";
  for (const c of origVal) {
    if (typeof code === "string") {
      if (c === "(" && code === "") {
        word += "(";
        code = undefined;
      } else if (c === ")") {
        if (word !== "") {
          genres.push(word);
          word = "";
        }
        const genre = parseGenreCode(code);
        if (genre) {
          genres.push(genre);
        }
        code = undefined;
      } else {
        code += c;
      }
    } else if (c === "(") {
      code = "";
    } else {
      word += c;
    }
  }
  if (word) {
    if (genres.length === 0 && /^\d*$/.test(word)) {
      word = Genres[Number.parseInt(word, 10)];
    }
    genres.push(word);
  }
  return genres;
};

const parseGenreCode = (code: string): string | undefined => {
  return Genres[Number.parseInt(code, 10)] ?? { RX: "Remix", CR: "Cover" }[code];
};

/**
 * Converts TMCL (Musician credits list) or TIPL (Involved people list)
 * @param entries
 * @returns
 */
export const functionList = (entries: string[]): Record<string, string[]> => {
  const res: Record<string, string[]> = {};
  for (let i = 0; i + 1 < entries.length; i += 2) {
    const names: string[] = entries[i + 1].split(",");
    res[entries[i]] = Object.hasOwn(res, entries[i]) ? [...res[entries[i]], ...names] : names;
  }
  return res;
};

export const readIdentifierAndData = (
  buffer: Uint8Array,
  start: number,
  end: number,
  encoding: number
): { id: string; data: Uint8Array } => {
  const zero = (encoding === 1 || encoding === 2 ? findZeroZero : findZero)(buffer, start, end);
  const id = readId3v2String(encoding)(buffer, start, zero - start);

  start = zero + getNullTerminatorLength(encoding);
  const data = readBuffer(buffer, start, end - start);

  return { id, data };
};

const getNullTerminatorLength = (enc: number): number => {
  return [1, 2, 2][enc] ?? 1;
};

const defaultEnc: StringEncoding = "latin1"; // latin1 == iso-8859-1;

export const readNullTerminatedString = (
  buffer: Uint8Array,
  start: number,
  end: number,
  encode: StringEncoding = defaultEnc
): [text: string, offset: number] => {
  const fzero = findZeroByEncode(buffer, start, end, encode);
  const text = decodeString(buffer.slice(start, fzero), encode);
  return [text, fzero + (encode === "utf16le" ? 2 : 1)];
};
