import { parseSeek } from "../base/ignore";
import { parseSignedInt8 } from "../base/signed-integer";
import { parseLatin1String } from "../base/string";
import { parseUnsignedInt16BigEndian, parseUnsignedInt32BigEndian } from "../base/unsigned-integer";
import { parseFourCC } from "../common/four-cc";
import type { IffChunk } from "../iff/chunk";

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

export const parseAiffCommonChunk = async (chunk: IffChunk): Promise<Common> => {
  const tokenizer = chunk.chunkData;

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

export const parseAiffCCommonChunk = async (chunk: IffChunk): Promise<Common> => {
  const tokenizer = chunk.chunkData;

  const numChannels = await parseUnsignedInt16BigEndian(tokenizer);
  const numSampleFrames = await parseUnsignedInt32BigEndian(tokenizer);
  const sampleSize = await parseUnsignedInt16BigEndian(tokenizer);
  const shift = (await parseUnsignedInt16BigEndian(tokenizer)) - 0x40_0e;
  const baseSampleRate = await parseUnsignedInt16BigEndian(tokenizer);

  let compressionName;

  await parseSeek(tokenizer, 6);
  const compressionType = await parseFourCC(tokenizer);
  if (chunk.chunkSize > 22) {
    const strLen = await parseSignedInt8(tokenizer);
    const padding = (strLen + 1) % 2;
    if (23 + strLen + padding === chunk.chunkSize) {
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
