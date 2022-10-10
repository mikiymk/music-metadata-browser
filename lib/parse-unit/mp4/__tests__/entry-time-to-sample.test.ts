import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { timeToSample, type TimeToSample } from "../entry-time-to-sample";

test("MP4 stts atom entry time to sample size", () => {
  const [size] = timeToSample;

  expect(size).toBe(8);
});

type Case = [description: string, source: number[], expected: TimeToSample];
const cases: Case[] = [
  [
    "parse stts atom entry time to sample",
    [0x00, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70],
    {
      count: 0x00_10_20_30,
      duration: 0x40_50_60_70,
    },
  ],
];

describe("unit: MP4 stts atom entry time to sample", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, timeToSample);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
