import { expect, test } from "vitest";

import { generateBuffer } from "../../../../../test/util";
import { APEV2_HEADER_SIZE, readApev2Header } from "../header";

test("apev2 descriptor size = 52", () => {
  expect(APEV2_HEADER_SIZE).toBe(24);
});

test("read apev2 descriptor", () => {
  const buffer = generateBuffer(
    [0x01, 0x02],
    [0x02, 0x02],
    [0x03, 0x02, 0x03, 0x04],
    [0x04, 0x02, 0x03, 0x04],
    [0x05, 0x02, 0x03, 0x04],
    [0x06, 0x02],
    [0x07, 0x02],
    [0x08, 0x02, 0x03, 0x04]
  );
  const result = readApev2Header(buffer, 0);
  expect(result).toEqual({
    compressionLevel: 0x02_01,
    formatFlags: 0x02_02,
    blocksPerFrame: 0x04_03_02_03,
    finalFrameBlocks: 0x04_03_02_04,
    totalFrames: 0x04_03_02_05,
    bitsPerSample: 0x02_06,
    channel: 0x02_07,
    sampleRate: 0x04_03_02_08,
  });
});
