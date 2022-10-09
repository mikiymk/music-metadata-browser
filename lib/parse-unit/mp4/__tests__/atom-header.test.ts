import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4AtomHeader, type Mp4AtomHeader } from "../atom-header";

test("MP4 atom header size", () => {
  const [size] = mp4AtomHeader;

  expect(size).toBe(8);
});

type Case = [description: string, source: number[], expected: Mp4AtomHeader];
const cases: Case[] = [
  ["parse atom header", [0x41, 0x42, 0x43, 0x44, 0x51, 0x52, 0x53, 0x54], { length: 0x41_42_43_44n, name: "QRST" }],
];

describe("unit: MP4 atom header", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4AtomHeader);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
