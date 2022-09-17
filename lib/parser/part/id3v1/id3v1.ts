import { ParseError } from "../../../errors/parse-error";
import { isSuccess, Result } from "../../../result/result";
import { readUint8 } from "../../base/unsigned-integer";

import { readId3v1String } from "./string";

export interface Id3v1 {
  header: "TAG";
  title: string;
  artist: string;
  album: string;
  year: string;
  comment: string;
  zeroByte: number;
  track: number;
  genre: number;
}

export const ID3V1_SIZE = 128;

/**
 * @param buffer Buffer possibly holding the 128 bytes ID3v1.1 metadata header
 * @param offset Offset in buffer in bytes
 * @returns ID3v1.1 header if first 3 bytes equals 'TAG', otherwise null is returned
 */
export const readId3v1 = (buffer: Uint8Array, offset: number): Result<Id3v1, RangeError | ParseError> => {
  const header = readId3v1String(buffer, offset, 3);
  const title = readId3v1String(buffer, offset + 3, 30);
  const artist = readId3v1String(buffer, offset + 33, 30);
  const album = readId3v1String(buffer, offset + 63, 30);
  const year = readId3v1String(buffer, offset + 93, 4);
  const comment = readId3v1String(buffer, offset + 97, 30);

  // ID3v1.1 separator for track
  const zeroByte = readUint8(buffer, offset + 125);
  // track: ID3v1.1 field added by Michael Mutschler
  const track = readUint8(buffer, offset + 126);
  const genre = readUint8(buffer, offset + 127);

  if (!isSuccess(header)) return header;
  if (header !== "TAG") return new ParseError("Buffer does not contain ID3v1");
  if (!isSuccess(title)) return title;
  if (!isSuccess(artist)) return artist;
  if (!isSuccess(album)) return album;
  if (!isSuccess(year)) return year;
  if (!isSuccess(comment)) return comment;
  if (!isSuccess(zeroByte)) return zeroByte;
  if (!isSuccess(track)) return track;
  if (!isSuccess(genre)) return genre;
  return { header, title, artist, album, year, comment, zeroByte, track, genre };
};
