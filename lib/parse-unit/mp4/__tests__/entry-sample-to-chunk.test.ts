import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { sampleToChunk, type SampleToChunk } from "../entry-sample-to-chunk";

test("MP4 atom stsc entry sample-to-chunk size", () => {
  const [size] = sampleToChunk;

  expect(size).toBe(12);
});

type Case = [description: string, source: number[], expected: SampleToChunk];
const cases: Case[] = [
  [
    "parse atom stsc entry sample-to-chunk",
    [0x00, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80, 0x90, 0xa0, 0xb0],
    {
      firstChunk: 0x00_10_20_30,
      samplesPerChunk: 0x40_50_60_70,
      sampleDescriptionId: 0x80_90_a0_b0,
    },
  ],
];

describe("unit: MP4 atom stsc entry sample-to-chunk", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, sampleToChunk);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
