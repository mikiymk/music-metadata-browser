import { expect, test, describe } from "vitest";

import { generateBuffer } from "../../../../../test/util";
import { aiffCommonChunk } from "../common";

describe("AIFF/AIFC common chunk", () => {
  test("AIFF common chunk", () => {
    const buffer = generateBuffer(
      [0x01, 0x02],
      [0x02, 0x04, 0x06, 0x08],
      [0x03, 0x06],
      [0x40, 0x0e, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a]
    );
    const result = aiffCommonChunk(18, false)[1](buffer, 0);
    expect(result).toEqual({
      numChannels: 0x01_02,
      numSampleFrames: 0x02_04_06_08,
      sampleSize: 0x03_06,
      sampleRate: 0x03_04,
      compressionName: "PCM",
    });
  });

  test("AIFC common chunk odd pstring", () => {
    const buffer = generateBuffer(
      [0x01, 0x02],
      [0x02, 0x04, 0x06, 0x08],
      [0x03, 0x06],
      [0x40, 0x0e, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a],
      "EXT ",
      0x03,
      "abc"
    );

    const result = aiffCommonChunk(26, true)[1](buffer, 0);
    expect(result).toEqual({
      numChannels: 0x01_02,
      numSampleFrames: 0x02_04_06_08,
      sampleSize: 0x03_06,
      sampleRate: 0x03_04,
      compressionType: "EXT ",
      compressionName: "abc",
    });
  });

  test("AIFC common chunk even pstring", () => {
    const buffer = generateBuffer(
      [0x01, 0x02],
      [0x02, 0x04, 0x06, 0x08],
      [0x03, 0x06],
      [0x40, 0x0e, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a],
      "EXT ",
      0x04,
      "abcd",
      0x00
    );

    const result = aiffCommonChunk(28, true)[1](buffer, 0);
    expect(result).toEqual({
      numChannels: 0x01_02,
      numSampleFrames: 0x02_04_06_08,
      sampleSize: 0x03_06,
      sampleRate: 0x03_04,
      compressionType: "EXT ",
      compressionName: "abcd",
    });
  });
});
