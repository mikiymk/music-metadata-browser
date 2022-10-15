import { test, expect, describe } from "vitest";

import { BufferTokenizer } from "../../../strtok3/BufferTokenizer";
import { u8 } from "../../primitive/integer";
import { readUnitFromTokenizer } from "../../utility/read-unit";
import { extendedLameHeader, type ExtendedLameHeader } from "../extended-lame-header";

test("Mpeg replay gain size", () => {
  const [size] = extendedLameHeader;

  expect(size).toBe(27);
});

type Case = [description: string, source: number[], expected: ExtendedLameHeader];
const cases: Case[] = [
  [
    "parse replay gain",
    [
      // Info tag revision and VBR method
      0xab,
      // Lowpass filter / 100
      0xe0,
      // Peak signal amplitude
      0xf1, 0xe1, 0xd1, 0xc1,
      // Radio Replay Gain
      0b0010_0101, 0b1111_0000,
      // Audiophile Replay Gain
      0b0100_1110, 0b0111_1110,
      // Encoding flags and ATH type
      0xcd,
      // specified bitrate or minimal bitrate
      0xc3,
      // Encoder delays
      0xee, 0xef, 0xff,
      // Misc
      0xa5,
      // MP3 Gain
      0x10,
      // Preset and surround info
      0b1111_1000, 0b0000_0000,
      // MusicLength
      0x10, 0x20, 0x30, 0x40,
      // MusicCRC
      0x56, 0x78,
      // CRC-16 of Info Tag
      0x9a, 0xbc,
    ],
    {
      revision: 0xa,
      vbr_method: 0xb,
      lowpass_filter: 0xe0 * 100,
      track_peak: 0xf1_e1_d1_c1 / 2 ** 23,
      track_gain: {
        type: 0b001,
        origin: 0b001,
        adjustment: +0b1_1111_0000,
      },
      album_gain: {
        type: 0b010,
        origin: 0b011,
        adjustment: -0b0_0111_1110,
      },
      music_length: 0x10_20_30_40,
      music_crc: 0x56_78,
      header_crc: 0x9a_bc,
    },
  ],
];

describe("unit: Mpeg replay gain", () => {
  test.each(cases)("%s", async (_, bytes, expected) => {
    const buffer = new Uint8Array(bytes);
    const tokenizer = new BufferTokenizer(buffer);
    const result = readUnitFromTokenizer(tokenizer, extendedLameHeader);

    await expect(result).resolves.toEqual(expected);

    // all bytes are read
    await expect(readUnitFromTokenizer(tokenizer, u8)).rejects.toThrow();
  });
});
