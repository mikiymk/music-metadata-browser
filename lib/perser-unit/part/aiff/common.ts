import { cVal } from "../../base/const";
import { ignore } from "../../base/ignore";
import { latin1 } from "../../base/string";
import { u16be, u32be, u8 } from "../../base/unsigned-integer";
import { seqMap, TokenReader } from "../../token";
import { fourCc } from "../fourcc/fourcc";

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

type AiffCommonChunk = [
  numChannels: number,
  numSampleFrames: number,
  sampleSize: number,
  sampleRate: number,
  compressionType: string | undefined,
  compressionName: string
];

const common = (
  numChannels: number,
  numSampleFrames: number,
  sampleSize: number,
  sampleRate: number,
  compressionType?: string,
  compressionName?: string
) => ({
  numChannels,
  numSampleFrames,
  sampleSize,
  sampleRate,
  compressionType,
  compressionName,
});

export const aiffCommonChunk = (length: number, isCompressed: boolean): TokenReader<Common> => {
  return isCompressed
    ? seqMap(common, u16be, u32be, u16be, f80, fourCc, pstring(length - 22))
    : seqMap(common, u16be, u32be, u16be, f80, ignore(0), cVal("PCM"));
};

export const f80 = seqMap(
  (shift, baseSampleRate) => {
    shift -= 16_398;
    return shift < 0 ? baseSampleRate >> Math.abs(shift) : baseSampleRate << shift;
  },
  u16be,
  u16be,
  u16be,
  u16be,
  u16be
);

const pstring = (length: number): TokenReader<string> => [
  length,
  (buffer, offset) => {
    const strLen = u8[1](buffer, offset);
    const padding = (strLen + 1) % 2;
    if (1 + strLen + padding === length) {
      return latin1(strLen)[1](buffer, offset + 1);
    } else {
      throw new Error(`Illegal pstring length ${length}`);
    }
  },
];
