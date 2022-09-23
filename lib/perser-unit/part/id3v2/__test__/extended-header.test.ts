import { test, expect } from "vitest";

import { id3v2ExtendedHeaderSize } from "../extended-header";

const buffer = new Uint8Array([0x00, 0x00, 0x01, 0x03]);

test("read ID3v2.2 extended header size = 0", () => {
  const [size, reader] = id3v2ExtendedHeaderSize(2);

  expect(size).toEqual(0);
  expect(reader(buffer, 0)).toEqual(0);
});

test("read ID3v2.3 extended header size = u32", () => {
  const [size, reader] = id3v2ExtendedHeaderSize(3);

  expect(size).toEqual(4);
  expect(reader(buffer, 0)).toEqual(0x01_03);
});

test("read ID3v2.4 extended header size = syncsafe u32", () => {
  const [size, reader] = id3v2ExtendedHeaderSize(4);

  expect(size).toEqual(4);
  expect(reader(buffer, 0)).toEqual(0x83);
});
