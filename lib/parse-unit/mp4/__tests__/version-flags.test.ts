import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4VersionFlags, type Mp4VersionFlags } from "../version-flags";

test("MP4 version and flags size", () => {
  const [size] = mp4VersionFlags;

  expect(size).toBe(4);
});

type Case = [description: string, source: number[], expected: Mp4VersionFlags];
const cases: Case[] = [
  [
    "parse version and flags",
    [0x10, 0x20, 0x30, 0x40],
    {
      version: 0x10,
      flags: 0x20_30_40,
    },
  ],
];

describe("unit: MP4 version and flags", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4VersionFlags);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
