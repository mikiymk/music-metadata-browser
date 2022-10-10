import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4AtomStts, type Mp4AtomStts } from "../atom-stts";

test("MP4 atom stts size", () => {
  const [size] = mp4AtomStts(24);

  expect(size).toBe(24);
});

type Case = [description: string, source: number[], expected: Mp4AtomStts];
const cases: Case[] = [
  [
    "parse atom stts",
    [
      0x10, 0x20, 0x30, 0x40, 0x00, 0x00, 0x00, 0x04, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80, 0x10, 0x20, 0x30,
      0x40, 0x50, 0x60, 0x70, 0x80, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60,
      0x70, 0x80,
    ],
    {
      version: 0x10,
      flags: 0x20_30_40,
      entriesCount: 0x04,
      entries: [
        {
          count: 0x10_20_30_40,
          duration: 0x50_60_70_80,
        },
        {
          count: 0x10_20_30_40,
          duration: 0x50_60_70_80,
        },
        {
          count: 0x10_20_30_40,
          duration: 0x50_60_70_80,
        },
        {
          count: 0x10_20_30_40,
          duration: 0x50_60_70_80,
        },
      ],
    },
  ],
];

describe("unit: MP4 atom stts", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4AtomStts(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
