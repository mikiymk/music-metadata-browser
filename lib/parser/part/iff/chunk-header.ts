import { readUint32be } from "../../base/unsigned-integer";
import { readFourCcToken } from "../fourcc/fourcc";

export interface IffChunkHeader {
  id: string;
  size: number;
}

export const IFF_CHUNK_HEADER_SIZE = 8;

/**
 * @param buffer Buffer possibly holding the 128 bytes ID3v1.1 metadata header
 * @param offset Offset in buffer in bytes
 * @returns ID3v1.1 header if first 3 bytes equals 'TAG', otherwise null is returned
 */
export const readIffChunkHeader = (buffer: Uint8Array, offset: number): IffChunkHeader => {
  return { id: readFourCcToken(buffer, offset), size: readUint32be(buffer, offset + 4) };
};
