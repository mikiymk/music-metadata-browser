import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4AtomStsc, type Mp4AtomStsc } from "../atom-stsc";

test("MP4 version and flags size", () => {
  const [size] = mp4AtomStsc(24);

  expect(size).toBe(24);
});

type Case = [description: string, source: number[], expected: Mp4AtomStsc];
const cases: Case[] = [
  [
    "parse version and flags",
    [
      0x10, 0x20, 0x30, 0x40, 0x00, 0x00, 0x00, 0x04, 0x00, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80, 0x90, 0xa0,
      0xb0, 0x01, 0x11, 0x21, 0x31, 0x41, 0x51, 0x61, 0x71, 0x81, 0x91, 0xa1, 0xb1, 0x02, 0x12, 0x22, 0x32, 0x42, 0x52,
      0x62, 0x72, 0x82, 0x92, 0xa2, 0xb2, 0x03, 0x13, 0x23, 0x33, 0x43, 0x53, 0x63, 0x73, 0x83, 0x93, 0xa3, 0xb3,
    ],
    {
      version: 0x10,
      flags: 0x20_30_40,
      entriesCount: 0x04,
      entries: [
        {
          firstChunk: 0x00_10_20_30,
          samplesPerChunk: 0x40_50_60_70,
          sampleDescriptionId: 0x80_90_a0_b0,
        },
        {
          firstChunk: 0x01_11_21_31,
          samplesPerChunk: 0x41_51_61_71,
          sampleDescriptionId: 0x81_91_a1_b1,
        },
        {
          firstChunk: 0x02_12_22_32,
          samplesPerChunk: 0x42_52_62_72,
          sampleDescriptionId: 0x82_92_a2_b2,
        },
        {
          firstChunk: 0x03_13_23_33,
          samplesPerChunk: 0x43_53_63_73,
          sampleDescriptionId: 0x83_93_a3_b3,
        },
      ],
    },
  ],
];

describe("unit: MP4 version and flags", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4AtomStsc(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
