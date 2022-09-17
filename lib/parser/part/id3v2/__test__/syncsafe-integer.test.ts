import { test, expect } from "vitest";

import { SYNCSAFE_UINT32_SIZE, readSyncSafeUint32be } from "../syncsafe-integer";

test("syncsafe int32 size", () => {
  expect(SYNCSAFE_UINT32_SIZE).toBe(4);
});

test("decode syncsafe integer", () => {
  const buffer = new Uint8Array([
    0b0111_1111, 0b0111_1111, 0b0111_1111, 0b0111_1111, 0b0101_0101, 0b0010_1010, 0b0101_0101, 0b0010_1010,
  ]);

  expect(readSyncSafeUint32be(buffer, 0)).toBe(0b0000_1111_1111_1111_1111_1111_1111_1111);
  expect(readSyncSafeUint32be(buffer, 4)).toBe(0b0000_1010_1010_1010_1010_1010_1010_1010);
});

test("decode invalid syncsafe integer", () => {
  const buffer = new Uint8Array([
    0b1111_1111, 0b1111_1111, 0b1111_1111, 0b1111_1111, 0b1010_1010, 0b1010_1010, 0b1010_1010, 0b1010_1010,
  ]);

  expect(readSyncSafeUint32be(buffer, 0)).toBe(0b0000_1111_1111_1111_1111_1111_1111_1111);
  expect(readSyncSafeUint32be(buffer, 4)).toBe(0b0000_0101_0100_1010_1001_0101_0010_1010);
});
