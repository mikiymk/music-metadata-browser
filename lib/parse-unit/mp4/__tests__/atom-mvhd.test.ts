import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { mp4AtomMvhd, type Mp4AtomMvhd } from "../atom-mvhd";

test("MP4 atom mvhd size", () => {
  const [size] = mp4AtomMvhd(100);

  expect(size).toBe(100);
});

type Case = [description: string, source: number[], expected: Mp4AtomMvhd];
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
      // time scale
      0x00, 0x01, 0x02, 0x03,
      // duration
      0x04, 0x05, 0x06, 0x07,
      // preferred rate
      0x08, 0x09, 0x0a, 0x0b,
      // preferred volume
      0x0c, 0x0d,
      // reserved
      0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
      // matrix structure
      0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a,
      0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b,
      // preview time
      0x3c, 0x3d, 0x3e, 0x3f,
      // preview duration
      0x40, 0x41, 0x42, 0x43,
      // poster time
      0x44, 0x45, 0x46, 0x47,
      // selection time
      0x48, 0x49, 0x4a, 0x4b,
      // selection duration
      0x4c, 0x4d, 0x4e, 0x4f,
      // current time
      0x50, 0x51, 0x52, 0x53,
      // next track id
      0x54, 0x55, 0x56, 0x57,
    ],
    {
      version: 0x10,
      flags: 0x20_30_40,
      creationTime: new Date("1950-01-01T00:00:00.000Z"),
      modificationTime: new Date("2000-01-01T00:00:00.000Z"),
      timeScale: 0x00_01_02_03,
      duration: 0x04_05_06_07,
      preferredRate: 0x08_09_0a_0b,
      preferredVolume: 0x0c_0d,
      previewTime: 0x3c_3d_3e_3f,
      previewDuration: 0x40_41_42_43,
      posterTime: 0x44_45_46_47,
      selectionTime: 0x48_49_4a_4b,
      selectionDuration: 0x4c_4d_4e_4f,
      currentTime: 0x50_51_52_53,
      nextTrackID: 0x54_55_56_57,
    },
  ],
];

describe("unit: MP4 atom mvhd", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, mp4AtomMvhd(buffer.length));

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
