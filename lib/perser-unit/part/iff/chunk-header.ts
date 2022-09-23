import { u32be } from "../../base/unsigned-integer";
import { seqMap } from "../../token";
import { fourCc } from "../fourcc/fourcc";

export interface IffChunkHeader {
  id: string;
  size: number;
}

/**
 * @param buffer Buffer possibly holding the 128 bytes ID3v1.1 metadata header
 * @param offset Offset in buffer in bytes
 * @returns ID3v1.1 header if first 3 bytes equals 'TAG', otherwise null is returned
 */
export const iffChunkHeader = seqMap((id, size) => ({ id, size }), fourCc, u32be);
