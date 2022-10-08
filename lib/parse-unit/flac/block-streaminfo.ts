import { map } from "../combinate/map";
import { sequenceToObject } from "../combinate/sequence-to-object";
import { bytes } from "../primitive/bytes";
import { u16be, u24be, u32be } from "../primitive/integer";

import type { Unit } from "../type/unit";

/**
 * METADATA_BLOCK_DATA
 * Ref: https://xiph.org/flac/format.html#metadata_block_streaminfo
 */
export interface FlacBlockStreaminfo {
  // The minimum block size (in samples) used in the stream.
  minimumBlockSize: number;
  // The maximum block size (in samples) used in the stream.
  // (Minimum blocksize == maximum blocksize) implies a fixed-blocksize stream.
  maximumBlockSize: number;
  // The minimum frame size (in bytes) used in the stream.
  // May be 0 to imply the value is not known.
  minimumFrameSize: number;
  // The maximum frame size (in bytes) used in the stream.
  // May be 0 to imply the value is not known.
  maximumFrameSize: number;
  // Sample rate in Hz. Though 20 bits are available,
  // the maximum sample rate is limited by the structure of frame headers to 655350Hz.
  // Also, a value of 0 is invalid.
  sampleRate: number;
  // probably slower: sampleRate: common.getBitAllignedNumber(buf, off + 10, 0, 20),
  // (number of channels)-1. FLAC supports from 1 to 8 channels
  channels: number;
  // bits per sample)-1.
  // FLAC supports from 4 to 32 bits per sample. Currently the reference encoder and decoders only support up to 24 bits per sample.
  bitsPerSample: number;
  // Total samples in stream.
  // 'Samples' means inter-channel sample, i.e. one second of 44.1Khz audio will have 44100 samples regardless of the number of channels.
  // A value of zero here means the number of total samples is unknown.
  totalSamples: number;
  // the MD5 hash of the file (see notes for usage... it's a littly tricky)
  fileMD5: Uint8Array;
}

export const flacBlockStreaminfo: Unit<FlacBlockStreaminfo, RangeError> = map(
  sequenceToObject(
    {
      minimumBlockSize: 0,
      maximumBlockSize: 1,
      minimumFrameSize: 2,
      maximumFrameSize: 3,
      data1: 4,
      data2: 5,
      fileMD5: 6,
    },
    u16be,
    map(u16be, (value) => value / 1000), // TODO: why
    u24be,
    u24be,
    u32be,
    u32be,
    bytes(16)
  ),
  ({ data1, data2, ...value }) => {
    return {
      ...value,
      sampleRate: (data1 & 0b1111_1111_1111_1111_1111_0000_0000_0000) >> 12,
      channels: ((data1 & 0b0000_0000_0000_0000_0000_1110_0000_0000) >> 9) + 1,
      bitsPerSample: ((data1 & 0b0000_0000_0000_0000_0000_0001_1111_0000) >> 4) + 1,
      totalSamples: (data1 & 0b0000_0000_0000_0000_0000_0000_0000_1111) * 2 ** 32 + data2,
    };
  }
);
