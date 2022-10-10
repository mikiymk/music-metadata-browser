import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4AtomName, type Mp4AtomName } from "../atom-name";

test("MP4 atom Data size", () => {
  const [size] = mp4AtomName(24);

  expect(size).toBe(24);
});

type Case = [description: string, source: number[], expected: Mp4AtomName];
const cases: Case[] = [
  [
    "parse atom Data",
    [0x00, 0x00, 0x00, 0x00, 0x41, 0x42, 0x43, 0x2d, 0x61, 0x62, 0x63],
    {
      version: 0x00,
      flags: 0x00_00_00,
      name: "ABC-abc",
    },
  ],
];

describe("unit: MP4 atom Data", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4AtomName(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
