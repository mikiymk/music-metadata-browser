import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4AtomTableEntries, type Mp4AtomTableEntries } from "../table-entries";

test("MP4 table entries size", () => {
  const [size] = mp4AtomTableEntries(24, u8);

  expect(size).toBe(24);
});

type Case = [description: string, source: number[], expected: Mp4AtomTableEntries<number>];
const cases: Case[] = [
  [
    "parse table entries",
    [0x00, 0x00, 0x00, 0x0a, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a],
    {
      entriesCount: 10,
      entries: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  ],
];

describe("unit: MP4 table entries", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4AtomTableEntries(buffer.length, u8));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
