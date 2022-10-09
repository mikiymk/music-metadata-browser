import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { matroskaFloat } from "../float";

test("Matroska sized float size", () => {
  const [size] = matroskaFloat(4);

  expect(size).toBe(4);
});

type Case = [description: string, source: number[], expected: number];
const cases: Case[] = [
  ["parse 0 bits", [], 0],
  ["parse 32 bits", [0x3f, 0xa0, 0x00, 0x00], 1.25],
  ["parse 64 bits", [0x3f, 0xf4, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], 1.25],
  ["parse 64 bits (10 bytes)", [0x3f, 0xf4, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff], 1.25],
];

describe("unit: Matroska sized float", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, matroskaFloat(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
