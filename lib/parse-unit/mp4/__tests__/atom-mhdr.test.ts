import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4AtomMhdr, type Mp4AtomMhdr } from "../atom-mhdr";

test("MP4 atom mhdr size", () => {
  const [size] = mp4AtomMhdr;

  expect(size).toBe(8);
});

type Case = [description: string, source: number[], expected: Mp4AtomMhdr];
const cases: Case[] = [
  [
    "parse atom mhdr",
    [0x10, 0x20, 0x30, 0x40, 0x00, 0x01, 0x02, 0x03],
    {
      version: 0x10,
      flags: 0x20_30_40,
      nextItemID: 0x00_01_02_03,
    },
  ],
];

describe("unit: MP4 atom mhdr", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4AtomMhdr);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
