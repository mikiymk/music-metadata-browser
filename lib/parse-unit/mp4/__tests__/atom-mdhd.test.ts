import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4AtomMdhd, type Mp4AtomMdhd } from "../atom-mdhd";

test("MP4 atom Data size", () => {
  const [size] = mp4AtomMdhd(24);

  expect(size).toBe(24);
});

type Case = [description: string, source: number[], expected: Mp4AtomMdhd];
const cases: Case[] = [
  [
    "parse atom Data",
    [
      0x10, 0x00, 0x00, 0x00, 0x56, 0x87, 0x13, 0x00, 0xb4, 0x92, 0xf4, 0x00, 0x20, 0x20, 0x20, 0x20, 0x30, 0x30, 0x30,
      0x30, 0x40, 0x40, 0x50, 0x50,
    ],
    {
      version: 0x10,
      flags: 0x00_00_00,
      creationTime: new Date("1950-01-01T00:00:00.000Z"),
      modificationTime: new Date("2000-01-01T00:00:00.000Z"),
      timeScale: 0x20_20_20_20,
      duration: 0x30_30_30_30,
      language: 0x40_40,
      quality: 0x50_50,
    },
  ],
];

describe("unit: MP4 atom Data", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4AtomMdhd(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
