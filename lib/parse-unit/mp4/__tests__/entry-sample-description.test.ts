import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { sampleDescription, type SampleDescription } from "../entry-sample-description";

import type { FourCC } from "../../iff/four-cc";

test("MP4 version and flags size", () => {
  const [size] = sampleDescription(24);

  expect(size).toBe(24);
});

type Case = [description: string, source: number[], expected: SampleDescription];
const cases: Case[] = [
  [
    "parse version and flags",
    [
      0x41, 0x42, 0x43, 0x44, 0x00, 0x10, 0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80, 0x90, 0xa0, 0xb0, 0xc0, 0xd0, 0xe0,
      0xf0,
    ],
    {
      dataFormat: "ABCD" as FourCC,
      dataReferenceIndex: 0x60_70,
      description: new Uint8Array([0x80, 0x90, 0xa0, 0xb0, 0xc0, 0xd0, 0xe0, 0xf0]),
    },
  ],
];

describe("unit: MP4 version and flags", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, sampleDescription(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
