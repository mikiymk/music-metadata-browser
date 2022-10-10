import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4AtomStco, type Mp4AtomStco } from "../atom-stco";

test("MP4 table entries size", () => {
  const [size] = mp4AtomStco(24);

  expect(size).toBe(24);
});

type Case = [description: string, source: number[], expected: Mp4AtomStco];
const cases: Case[] = [
  [
    "parse table entries",
    [
      0x10, 0x20, 0x30, 0x40, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a,
      0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
    ],
    {
      version: 0x10,
      flags: 0x20_30_40,
      entriesCount: 4,
      entries: [0x00_01_02_03, 0x04_05_06_07, 0x08_09_0a_0b, 0x0c_0d_0e_0f],
    },
  ],
];

describe("unit: MP4 table entries", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4AtomStco(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
