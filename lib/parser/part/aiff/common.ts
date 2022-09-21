import { readLatin1String } from "../../base/string";
import { readUint16be, readUint32be, readUint8 } from "../../base/unsigned-integer";
import { readFourCcToken } from "../fourcc/fourcc";

/**
 * The Common Chunk.
 * Describes fundamental parameters of the waveform data such as sample rate, bit resolution, and how many channels of
 * digital audio are stored in the FORM AIFF.
 */
export interface Common {
  numChannels: number;
  numSampleFrames: number;
  sampleSize: number;
  sampleRate: number;
  compressionType?: string;
  compressionName?: string;
}

export const readCommonToken = (buffer: Uint8Array, offset: number, length: number, isCompressed: boolean) => {
  const minimumChunkSize = isCompressed ? 22 : 18;
  if (length < minimumChunkSize) throw new Error(`COMMON CHUNK size should always be at least ${minimumChunkSize}`);

  const chunk: Common = {
    numChannels: readUint16be(buffer, offset),
    numSampleFrames: readUint32be(buffer, offset + 2),
    sampleSize: readUint16be(buffer, offset + 6),
    sampleRate: readAiffFloat80(buffer, offset + 8),
  };

  if (isCompressed) {
    chunk.compressionType = readFourCcToken(buffer, offset + 18);
    if (length > 22) {
      const strLen = readUint8(buffer, offset + 22);
      const padding = (strLen + 1) % 2;
      if (23 + strLen + padding === length) {
        chunk.compressionName = readLatin1String(buffer, offset + 23, strLen);
      } else {
        throw new Error("Illegal pstring length");
      }
    }
  } else {
    chunk.compressionName = "PCM";
  }

  return chunk;
};

// Float80 from MacTypes.h
// struct Float80 {
//  int16_t   exp;		// exponent
//  uint16_t  man[4];		// mantissa
// };
export const readAiffFloat80 = (buffer: Uint8Array, offset: number) => {
  // see: https://cycling74.com/forums/aiffs-80-bit-sample-rate-value
  const shift = readUint16be(buffer, offset) - 16_398;
  const baseSampleRate = readUint16be(buffer, offset + 2);
  return shift < 0 ? baseSampleRate >> Math.abs(shift) : baseSampleRate << shift;
};
