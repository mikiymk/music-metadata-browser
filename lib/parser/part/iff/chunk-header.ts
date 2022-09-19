import { readLatin1String } from "../../base/string";
import { readUint32be } from "../../base/unsigned-integer";

export interface IffChunkHeader {
  id: string;
  size: number;
}

export const IffChunkHeaderSize = 8;

/**
 * @param buffer Buffer possibly holding the 128 bytes ID3v1.1 metadata header
 * @param offset Offset in buffer in bytes
 * @returns ID3v1.1 header if first 3 bytes equals 'TAG', otherwise null is returned
 */
export const readIffChunkHeader = (buffer: Uint8Array, offset: number): IffChunkHeader => {
  return { id: readLatin1String(buffer, offset, 4), size: readUint32be(buffer, offset + 4) };
};
