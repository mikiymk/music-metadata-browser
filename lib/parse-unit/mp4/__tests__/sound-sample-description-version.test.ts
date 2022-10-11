import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import {
  mp4SoundSampleDescriptionVersion,
  type Mp4SoundSampleDescriptionVersion,
} from "../sound-sample-description-version";

test("MP4 atom header size", () => {
  const [size] = mp4SoundSampleDescriptionVersion;

  expect(size).toBe(8);
});

type Case = [description: string, source: number[], expected: Mp4SoundSampleDescriptionVersion];
const cases: Case[] = [
  [
    "parse atom header",
    [0x41, 0x42, 0x43, 0x44, 0x51, 0x52, 0x53, 0x54],
    { version: 0x41_42, revision: 0x43_44, vendor: 0x51_52_53_54 },
  ],
];

describe("unit: MP4 atom header", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4SoundSampleDescriptionVersion);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
