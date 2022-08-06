import type { IChunkHeader } from "../../iff";
import type { ITokenizer } from "../../strtok3/types";
import { parseSeek } from "../base/ignore";
import { parseSignedInt8 } from "../base/signed-integer";
import { parseLatin1String } from "../base/string";
import { parseUnsignedInt16BigEndian, parseUnsignedInt32BigEndian } from "../base/unsigned-integer";
import { parseFourCC } from "../common/four-cc";

/**
 * The Common Chunk.
 * Describes fundamental parameters of the waveform data such as sample rate, bit resolution, and how many channels of
 * digital audio are stored in the FORM AIFF.
 */
export type Common = {
  numChannels: number;
  numSampleFrames: number;
  sampleSize: number;
  sampleRate: number;
  compressionType?: string;
  compressionName: string;
};

export const parseAiffCommonChunk = async (tokenizer: ITokenizer): Promise<Common> => {
  const numChannels = await parseUnsignedInt16BigEndian(tokenizer);
  const numSampleFrames = await parseUnsignedInt32BigEndian(tokenizer);
  const sampleSize = await parseUnsignedInt16BigEndian(tokenizer);
  const shift = (await parseUnsignedInt16BigEndian(tokenizer)) - 0x40_0e;
  const baseSampleRate = await parseUnsignedInt16BigEndian(tokenizer);

  const compressionName = "PCM";

  return {
    numChannels,
    numSampleFrames,
    sampleSize,
    sampleRate: shift < 0 ? baseSampleRate >> Math.abs(shift) : baseSampleRate << shift,
    compressionName,
  };
};

export const parseAiffCCommonChunk = async (tokenizer: ITokenizer, header: IChunkHeader): Promise<Common> => {
  const numChannels = await parseUnsignedInt16BigEndian(tokenizer);
  const numSampleFrames = await parseUnsignedInt32BigEndian(tokenizer);
  const sampleSize = await parseUnsignedInt16BigEndian(tokenizer);
  const shift = (await parseUnsignedInt16BigEndian(tokenizer)) - 0x40_0e;
  const baseSampleRate = await parseUnsignedInt16BigEndian(tokenizer);

  let compressionName;

  await parseSeek(tokenizer, 6);
  const compressionType = await parseFourCC(tokenizer);
  if (header.chunkSize > 22) {
    const strLen = await parseSignedInt8(tokenizer);
    const padding = (strLen + 1) % 2;
    if (23 + strLen + padding === header.chunkSize) {
      compressionName = await parseLatin1String(tokenizer, strLen);
      await parseSeek(tokenizer, padding);
    } else {
      throw new Error("Illegal pstring length");
    }
  }

  return {
    numChannels,
    numSampleFrames,
    sampleSize,
    sampleRate: shift < 0 ? baseSampleRate >> Math.abs(shift) : baseSampleRate << shift,
    compressionType,
    compressionName,
  };
};
