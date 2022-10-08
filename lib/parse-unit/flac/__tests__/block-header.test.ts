import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { flacBlockHeader, type FlacBlockHeader } from "../block-header";

test("Flac metadata block header size = 4", () => {
  const [size] = flacBlockHeader;

  expect(size).toBe(4);
});

type Case = [description: string, source: number[], expected: FlacBlockHeader];
const cases: Case[] = [
  ["parse Flac metadata block header", [0x06, 0x11, 0x22, 0x33], { lastBlock: false, type: 6, length: 0x11_22_33 }],
  ["parse Flac metadata block header", [0x80, 0x44, 0x55, 0x66], { lastBlock: true, type: 0, length: 0x44_55_66 }],
];

describe("unit: Flac metadata block header", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, flacBlockHeader);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
