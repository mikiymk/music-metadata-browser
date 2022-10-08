import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { flacBlockPicture, type FlacBlockPicture } from "../block-picture";

test("Flac metadata block stream info size = 4", () => {
  const [size] = flacBlockPicture(30);

  expect(size).toBe(30);
});

type Case = [description: string, source: number[], expected: FlacBlockPicture];
const cases: Case[] = [
  [
    "parse Flac metadata block stream info",
    [
      // picture type
      0x00, 0x00, 0x00, 0x0e,
      // format (MIME-type) length
      0x00, 0x00, 0x00, 0x0a,
      // format (MIME-type) (UTF-8)
      0x69, 0x6d, 0x61, 0x67, 0x65, 0x2f, 0x6a, 0x70, 0x65, 0x67,
      // description length
      0x00, 0x00, 0x00, 0x04,
      // description (UTF-8)
      0x64, 0x65, 0x73, 0x63,
      // picture width (pixels)
      0x00, 0x20, 0x00, 0x00,
      // picture height (pixels)
      0x00, 0x30, 0x00, 0x00,
      // color depth (bits per pixel)
      0x00, 0x40, 0x00, 0x00,
      // number of color
      0x00, 0x50, 0x00, 0x00,
      // data length
      0x00, 0x00, 0x00, 0x04,
      // data
      0x01, 0x02, 0x03, 0x04,
    ],
    {
      type: "During recording",
      format: "image/jpeg",
      description: "desc",
      width: 0x00_20_00_00,
      height: 0x00_30_00_00,
      colourDepth: 0x00_40_00_00,
      indexedColor: 0x00_50_00_00,
      data: new Uint8Array([0x01, 0x02, 0x03, 0x04]),
    },
  ],
];

describe("unit: Flac metadata block stream info", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, flacBlockPicture(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
