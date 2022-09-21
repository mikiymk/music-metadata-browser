import { readBuffer } from "../../base/buffer";

import { IffChunkHeader, readIffChunkHeader } from "./chunk-header";

import type { Result } from "../../../result/result";

export interface IffChunk {
  header: IffChunkHeader;
  data: Uint8Array;
}

/**
 * @param buffer Buffer possibly holding the 128 bytes ID3v1.1 metadata header
 * @param offset Offset in buffer in bytes
 * @returns ID3v1.1 header if first 3 bytes equals 'TAG', otherwise null is returned
 */
export const readIffChunk = (buffer: Uint8Array, offset: number): Result<IffChunk, RangeError> => {
  const header = readIffChunkHeader(buffer, offset);
  return { header, data: readBuffer(buffer, offset + 8, header.size) };
};