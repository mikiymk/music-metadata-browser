import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { vintLength } from "../vint-length";

test("EBML variable length integer size", () => {
  const [size] = vintLength(8);

  expect(size).toBe(1);
});

type Case = [description: string, source: number[], expected: number];
const cases: Case[] = [
  ["parse width = 0", [0b1000_0000], 1],
  ["parse width = 1", [0b0100_0000], 2],
  ["parse width = 2", [0b0010_0000], 3],
  ["parse width = 3", [0b0001_0000], 4],
  ["parse width = 4", [0b0000_1000], 5],
  ["parse width = 5", [0b0000_0100], 6],
  ["parse width = 6", [0b0000_0010], 7],
  ["parse width = 7", [0b0000_0001], 8],
  ["parse cannot read width", [0b0000_0000], 9],
];

describe("unit: EBML variable length integer", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, vintLength(8));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
