import { expect, test } from "vitest";

import { generateBuffer } from "../../../../../test/util";
import { APEV2_DESCRIPTOR_SIZE, readApev2Descriptor } from "../descriptor";

test("apev2 descriptor size = 52", () => {
  expect(APEV2_DESCRIPTOR_SIZE).toBe(52);
});

test("read apev2 descriptor", () => {
  const buffer = generateBuffer(
    "APE2",
    [0x01, 0x02, 0x03, 0x04],
    [0x02, 0x02, 0x03, 0x04],
    [0x03, 0x02, 0x03, 0x04],
    [0x04, 0x02, 0x03, 0x04],
    [0x05, 0x02, 0x03, 0x04],
    [0x06, 0x02, 0x03, 0x04],
    [0x07, 0x02, 0x03, 0x04],
    [0x08, 0x02, 0x03, 0x04],
    new Uint8Array(16)
  );
  const result = readApev2Descriptor(buffer, 0);
  expect(result).toEqual({
    id: "APE2",
    version: 0x04_03_02_01 / 1000,
    descriptorBytes: 0x04_03_02_02,
    headerBytes: 0x04_03_02_03,
    seekTableBytes: 0x04_03_02_04,
    headerDataBytes: 0x04_03_02_05,
    apeFrameDataBytes: 0x04_03_02_06,
    apeFrameDataBytesHigh: 0x04_03_02_07,
    terminatingDataBytes: 0x04_03_02_08,
    fileMD5: new Uint8Array(16),
  });
});
