import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import {
  mp4SoundSampleDescriptionVersion0,
  type Mp4SoundSampleDescriptionVersion0,
} from "../sound-sample-description-version0";

test("MP4 atom header size", () => {
  const [size] = mp4SoundSampleDescriptionVersion0;

  expect(size).toBe(12);
});

type Case = [description: string, source: number[], expected: Mp4SoundSampleDescriptionVersion0];
const cases: Case[] = [
  [
    "parse atom header",
    [0x41, 0x42, 0x43, 0x44, 0x51, 0x52, 0x53, 0x54, 0x61, 0x62, 0x63, 0x64],
    {
      numAudioChannels: 0x41_42,
      sampleSize: 0x43_44,
      compressionId: 0x51_52,
      packetSize: 0x53_54,
      sampleRate: 24_932.5444, // 0x6162.6364
    },
  ],
];

describe("unit: MP4 atom header", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4SoundSampleDescriptionVersion0);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
