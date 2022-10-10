import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4AtomData, type Mp4AtomData } from "../atom-data";

test("MP4 atom Data size", () => {
  const [size] = mp4AtomData(10);

  expect(size).toBe(10);
});

type Case = [description: string, source: number[], expected: Mp4AtomData];
const cases: Case[] = [
  [
    "parse atom Data",
    [0x10, 0x20, 0x21, 0x22, 0x30, 0x31, 0x40, 0x41, 0x50, 0x51, 0x52, 0x53],
    {
      type: 0x10,
      wellKnownType: 0x20_21_22,

      country: 0x30_31,
      language: 0x40_41,

      value: new Uint8Array([0x50, 0x51, 0x52, 0x53]),
    },
  ],
];

describe("unit: MP4 atom Data", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4AtomData(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
