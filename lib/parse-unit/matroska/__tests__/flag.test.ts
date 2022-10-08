import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { matroskaFlag } from "../flag";

test("Matroska sized flag size", () => {
  const [size] = matroskaFlag(5);

  expect(size).toBe(5);
});

type Case = [description: string, source: number[], expected: boolean];
const cases: Case[] = [
  ["parse false", [0x00], false],
  ["parse true", [0x01], true],
  ["parse size = 2 false", [0x00, 0x00], false],
  ["parse size = 2 true", [0x00, 0x01], true],
];

describe("unit: Matroska sized flag", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, matroskaFlag(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
