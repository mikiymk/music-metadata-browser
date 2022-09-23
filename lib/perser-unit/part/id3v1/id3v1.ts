import { u8 } from "../../base/unsigned-integer";
import { seqMap, TokenReader } from "../../token";

import { id3v1String } from "./string";

export interface Id3v1Header {
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

/**
 * @param buffer Buffer possibly holding the 128 bytes ID3v1.1 metadata header
 * @param offset Offset in buffer in bytes
 * @returns ID3v1.1 header if first 3 bytes equals 'TAG', otherwise null is returned
 */
export const id3v1Header: TokenReader<Id3v1Header | undefined> = seqMap(
  (header, title, artist, album, year, comment, zeroByte, track, genre) => {
    if (header !== "TAG") return;
    if (zeroByte !== 0) comment += String.fromCodePoint(zeroByte, track);

    return {
      header,
      title,
      artist,
      album,
      year,
      comment,
      zeroByte,
      track,
      genre,
    };
  },
  id3v1String(3),
  id3v1String(30),
  id3v1String(30),
  id3v1String(30),
  id3v1String(4),
  id3v1String(28),
  u8, // ID3v1.1 separator for track
  u8, // track: ID3v1.1 field added by Michael Mutschler
  u8
);
