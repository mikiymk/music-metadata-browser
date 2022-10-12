import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { timeMacEpoch } from "../time-mac-epoch";

test("MP4 time size", () => {
  const [size] = timeMacEpoch;

  expect(size).toBe(4);
});

type Case = [description: string, source: number[], expected: Date];
const cases: Case[] = [
  ["parse base date", [0x00, 0x00, 0x00, 0x00], new Date("1904-01-01T00:00:00.000Z")],
  ["parse 1950 year", [0x56, 0x87, 0x13, 0x00], new Date("1950-01-01T00:00:00.000Z")],
  ["parse 2000 year", [0xb4, 0x92, 0xf4, 0x00], new Date("2000-01-01T00:00:00.000Z")],
];

describe("unit: MP4 time Data", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, timeMacEpoch);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
