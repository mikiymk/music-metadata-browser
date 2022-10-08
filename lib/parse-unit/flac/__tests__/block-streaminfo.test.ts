import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { flacBlockStreaminfo, type FlacBlockStreaminfo } from "../block-streaminfo";

test("Flac metadata block stream info size = 4", () => {
  const [size] = flacBlockStreaminfo;

  expect(size).toBe(34);
});

type Case = [description: string, source: number[], expected: FlacBlockStreaminfo];
const cases: Case[] = [
  [
    "parse Flac metadata block stream info",
    [
      0x1a, 0x1b, 0x2a, 0x2b, 0x3a, 0x3b, 0x3c, 0x4a, 0x4b, 0x4c, 0x5a, 0x5b, 0x5c, 0x5d, 0x6a, 0x6b, 0x6c, 0x6d, 0x70,
      0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f,
    ],
    {
      minimumBlockSize: 0x1a_1b,
      maximumBlockSize: 0x2a_2b / 1000,
      minimumFrameSize: 0x3a_3b_3c,
      maximumFrameSize: 0x4a_4b_4c,
      sampleRate: 0x5_a5_b5,
      channels: 6 + 1,
      bitsPerSample: 5 + 1,
      totalSamples: 0xd_6a_6b_6c_6d,
      fileMD5: new Uint8Array([
        0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f,
      ]),
    },
  ],
];

describe("unit: Flac metadata block stream info", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, flacBlockStreaminfo);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
