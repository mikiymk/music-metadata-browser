import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4AtomTkhd, type Mp4AtomTkhd } from "../atom-tkhd";

test("MP4 atom mvhd size", () => {
  const [size] = mp4AtomTkhd(100);

  expect(size).toBe(100);
});

type Case = [description: string, source: number[], expected: Mp4AtomTkhd];
const cases: Case[] = [
  [
    "parse atom mvhd",
    [
      // version
      0x10,
      // flags
      0x20, 0x30, 0x40,
      // creation time
      0x56, 0x87, 0x13, 0x00,
      // modification time
      0xb4, 0x92, 0xf4, 0x00,
      // track id
      0x00, 0x01, 0x02, 0x03,
      // reserved
      0x04, 0x05, 0x06, 0x07,
      // duration
      0x08, 0x09, 0x0a, 0x0b,
      // reserved
      0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13,
      // layer
      0x14, 0x15,
      // alternate group
      0x16, 0x17,
      // volume
      0x18, 0x19,
      // reserved
      0x1a, 0x1b,
      // matrix structure
      0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e,
      0x2f, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f,
      // track width
      0x40, 0x41, 0x42, 0x43,
      // track height
      0x44, 0x45, 0x46, 0x47,
    ],
    {
      version: 0x10,
      flags: 0x20_30_40,
      creationTime: new Date("1950-01-01T00:00:00.000Z"),
      modificationTime: new Date("2000-01-01T00:00:00.000Z"),
      trackId: 0x00_01_02_03,
      duration: 0x08_09_0a_0b,
      layer: 0x14_15,
      alternateGroup: 0x16_17,
      volume: 0x18_19,
    },
  ],
];

describe("unit: MP4 atom mvhd", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4AtomTkhd(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
