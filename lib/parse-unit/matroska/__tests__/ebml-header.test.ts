import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { ebmlHeader, type EBMLHeader } from "../ebml-header";

type Case = [description: string, source: number[], expected: EBMLHeader];
const cases: Case[] = [
  ["parse width = 1", [0x81, 0x81], { id: 0x81, length: 0x01 }],
  ["parse width = 2", [0x41, 0x01, 0x21, 0x01, 0x01], { id: 0x41_01, length: 0x01_01_01 }],
  ["parse width = 3", [0x21, 0x01, 0x01, 0x09, 0x01, 0x01, 0x01, 0x01], { id: 0x21_01_01, length: 0x01_01_01_01_01 }],
  [
    "parse width = 4",
    [0x11, 0x01, 0x01, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01],
    { id: 0x11_01_01_01, length: 0x01_01_01_01_01_01 },
  ],
];

describe("unit: EBML header", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = ebmlHeader(tokenizer);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
