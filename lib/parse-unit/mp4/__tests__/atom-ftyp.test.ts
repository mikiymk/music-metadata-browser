import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4atomFtyp } from "../atom-ftyp";

test("MP4 atom ftyp size", () => {
  const [size] = mp4atomFtyp(10);

  expect(size).toBe(10);
});

type Case = [description: string, source: number[], expected: string[]];
const cases: Case[] = [
  [
    "parse atom ftyp",
    [0x66, 0x69, 0x6c, 0x65, 0x6d, 0x70, 0x34, 0x20, 0x6d, 0x70, 0x65, 0x67],
    ["file", "mp4 ", "mpeg"],
  ],
];

describe("unit: MP4 atom ftyp", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4atomFtyp(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
