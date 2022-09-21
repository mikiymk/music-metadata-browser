import { readUint8 } from "../../base/unsigned-integer";

import { readId3v1String } from "./string";

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

export const ID3V1_SIZE = 128;

/**
 * @param buffer Buffer possibly holding the 128 bytes ID3v1.1 metadata header
 * @param offset Offset in buffer in bytes
 * @returns ID3v1.1 header if first 3 bytes equals 'TAG', otherwise null is returned
 */
export const readId3v1 = (buffer: Uint8Array, offset: number): Id3v1Header => {
  const header = readId3v1String(buffer, offset, 3);
  if (header !== "TAG") return undefined;

  return {
    header,
    title: readId3v1String(buffer, offset + 3, 30),
    artist: readId3v1String(buffer, offset + 33, 30),
    album: readId3v1String(buffer, offset + 63, 30),
    year: readId3v1String(buffer, offset + 93, 4),
    comment: readId3v1String(buffer, offset + 97, 30),

    // ID3v1.1 separator for track
    zeroByte: readUint8(buffer, offset + 125),
    // track: ID3v1.1 field added by Michael Mutschler
    track: readUint8(buffer, offset + 126),
    genre: readUint8(buffer, offset + 127),
  };
};
