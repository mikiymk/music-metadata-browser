import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import {
  DataType,
  matroskaBinaryType,
  matroskaBooleanType,
  matroskaFloatType,
  matroskaStringType,
  matroskaUidType,
  matroskaUintType,
  matrsokaData,
} from "../data";

test("Matroska data size", () => {
  const [size] = matrsokaData(matroskaStringType, 4);

  expect(size).toBe(4);
});

type Case = [description: string, source: number[], type: DataType, expected: string | number | boolean | Uint8Array];
const cases: Case[] = [
  ["parse string", [0x41, 0x42, 0x43], matroskaStringType, "ABC"],
  ["parse unsigned integer", [0xa0, 0xa1, 0xa2, 0xa3], matroskaUintType, 0xa0_a1_a2_a3],
  ["parse uid", [0x00], matroskaUidType, false],
  ["parse flag", [0x01], matroskaBooleanType, true],
  ["parse binary", [0xa0, 0xa1, 0xa2, 0xa3, 0xa4], matroskaBinaryType, new Uint8Array([0xa0, 0xa1, 0xa2, 0xa3, 0xa4])],
  ["parse float", [0x3f, 0xa0, 0x00, 0x00], matroskaFloatType, 1.25],
];

describe("unit: Matroska data", () => {
  test.each(cases)("%s", async (_, bytes, type, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, matrsokaData(type, buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
