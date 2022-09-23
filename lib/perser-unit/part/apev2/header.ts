import { u16le, u32le } from "../../base/unsigned-integer";
import { seqMap } from "../../token";

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

export const apev2Header = seqMap(
  (
    compressionLevel,
    formatFlags,
    blocksPerFrame,
    finalFrameBlocks,
    totalFrames,
    bitsPerSample,
    channel,
    sampleRate
  ) => ({
    compressionLevel,
    formatFlags,
    blocksPerFrame,
    finalFrameBlocks,
    totalFrames,
    bitsPerSample,
    channel,
    sampleRate,
  }),
  u16le,
  u16le,
  u32le,
  u32le,
  u32le,
  u16le,
  u16le,
  u32le
);
