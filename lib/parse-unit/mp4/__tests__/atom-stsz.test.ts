import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4AtomStsz, type Mp4AtomStsz } from "../atom-stsz";

test("MP4 atom stsz size", () => {
  const [size] = mp4AtomStsz(24);

  expect(size).toBe(24);
});

type Case = [description: string, source: number[], expected: Mp4AtomStsz];
const cases: Case[] = [
  [
    "parse atom stsz",
    [
      0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80, 0x00, 0x00, 0x00, 0x04, 0x00, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60,
      0x70, 0x80, 0x90, 0xa0, 0xb0, 0xc0, 0xd0, 0xe0, 0xf0,
    ],
    {
      version: 0x10,
      flags: 0x20_30_40,
      sampleSize: 0x50_60_70_80,
      entriesCount: 0x04,
      entries: [0x00_10_20_30, 0x40_50_60_70, 0x80_90_a0_b0, 0xc0_d0_e0_f0],
    },
  ],
];

describe("unit: MP4 atom stsz", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4AtomStsz(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
