import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { replayGain, type ReplayGain } from "../replay-gain";

test("Mpeg replay gain size", () => {
  const [size] = replayGain;

  expect(size).toBe(2);
});

type Case = [description: string, source: number[], expected: ReplayGain];
const cases: Case[] = [
  [
    "parse replay gain",
    [0b0000_0000, 0b0000_0000],
    {
      type: 0b000,
      origin: 0b000,
      adjustment: 0b0_0000_0000,
    },
  ],
  [
    "parse replay gain",
    [0b0100_1110, 0b1101_1011],
    {
      type: 0b010 ,
      origin: 0b011 ,
      adjustment: -0b0_1101_1011,
    },
  ],
];

describe("unit: Mpeg replay gain", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, replayGain);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
