import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { matroskaString } from "../string";

test("Matroska sized unsigned integer size", () => {
  const [size] = matroskaString(5);

  expect(size).toBe(5);
});

type Case = [description: string, source: number[], expected: string];
const cases: Case[] = [
  ["parse string", [0x41, 0x42, 0x43], "ABC"],
  ["parse string strip /\\00.*$/g: \\00A", [0x41, 0x42, 0x43, 0x00, 0x30, 0x41], "ABC"],
  ["parse string strip /\\00.*$/g: \\0A", [0x41, 0x42, 0x43, 0x00, 0x41], "ABC"],
  ["parse string strip /\\00.*$/g: 00A", [0x41, 0x42, 0x43, 0x30, 0x30, 0x41], "ABC00A"],
  ["parse string strip /\\00.*$/g: 0\\0A", [0x41, 0x42, 0x43, 0x30, 0x00, 0x41], "ABC0"],
];

describe("unit: Matroska sized unsigned integer", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, matroskaString(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
