import type { ByteReader } from "../../byte-reader/byte-reader";
import { parseUnsignedInt16LittleEndian, parseUnsignedInt32LittleEndian } from "../base/unsigned-integer";

export type ApeHeader = {
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
};

export const parseApeHeader = async (reader: ByteReader): Promise<ApeHeader> => {
  // the compression level (see defines I.E. COMPRESSION_LEVEL_FAST)
  const compressionLevel = await parseUnsignedInt16LittleEndian(reader);
  // any format flags (for future use)
  const formatFlags = await parseUnsignedInt16LittleEndian(reader);
  // the number of audio blocks in one frame
  const blocksPerFrame = await parseUnsignedInt32LittleEndian(reader);
  // the number of audio blocks in the final frame
  const finalFrameBlocks = await parseUnsignedInt32LittleEndian(reader);
  // the total number of frames
  const totalFrames = await parseUnsignedInt32LittleEndian(reader);
  // the bits per sample (typically 16)
  const bitsPerSample = await parseUnsignedInt16LittleEndian(reader);
  // the number of channels (1 or 2)
  const channel = await parseUnsignedInt16LittleEndian(reader);
  // the sample rate (typically 44100)
  const sampleRate = await parseUnsignedInt32LittleEndian(reader);

  return {
    compressionLevel,
    formatFlags,
    blocksPerFrame,
    finalFrameBlocks,
    totalFrames,
    bitsPerSample,
    channel,
    sampleRate,
  };
};
