import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { matroskaUint } from "../uint";

test("Matroska sized unsigned integer size", () => {
  const [size] = matroskaUint(5);

  expect(size).toBe(5);
});

type Case = [description: string, source: number[], expected: number];
const cases: Case[] = [
  ["parse size = 1: u8", [0x10], 0x10],
  ["parse size = 2: u16", [0x10, 0x20], 0x10_20],
  ["parse size = 3: u24", [0x10, 0x20, 0x30], 0x10_20_30],
  ["parse size = 4: u32", [0x10, 0x20, 0x30, 0x40], 0x10_20_30_40],
  ["parse size = 5: u40", [0x10, 0x20, 0x30, 0x40, 0x50], 0x10_20_30_40_50],
  ["parse size = 6: u48", [0x10, 0x20, 0x30, 0x40, 0x50, 0x60], 0x10_20_30_40_50_60],
  ["parse size = 7: 1 byte pad + u48", [0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70], 0x20_30_40_50_60_70],
];

describe("unit: Matroska sized unsigned integer", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, matroskaUint(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
