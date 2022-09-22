import { readUint16le, readUint32le } from "../../base/unsigned-integer";

/**
 * APE_HEADER: describes all of the necessary information about the APE file
 */
export interface Apev2Header {
  // the compression level (see defines I.E. COMPRESSION_LEVEL_FAST)
  compressionLevel: number;
  // any format flags (for future use)
  formatFlags: number;
  // the number of audio blocks in one frame
  blocksPerFrame: number;
  // the number of audio blocks in the final frame
  finalFrameBlocks: number;
  // the total number of frames
  totalFrames: number;
  // the bits per sample (typically 16)
  bitsPerSample: number;
  // the number of channels (1 or 2)
  channel: number;
  // the sample rate (typically 44100)
  sampleRate: number;
}

export const APEV2_HEADER_SIZE = 24;

export const readApev2Header = (buffer: Uint8Array, offset: number): Apev2Header => {
  return {
    compressionLevel: readUint16le(buffer, offset),
    formatFlags: readUint16le(buffer, offset + 2),
    blocksPerFrame: readUint32le(buffer, offset + 4),
    finalFrameBlocks: readUint32le(buffer, offset + 8),
    totalFrames: readUint32le(buffer, offset + 12),
    bitsPerSample: readUint16le(buffer, offset + 16),
    channel: readUint16le(buffer, offset + 18),
    sampleRate: readUint32le(buffer, offset + 20),
  };
};
