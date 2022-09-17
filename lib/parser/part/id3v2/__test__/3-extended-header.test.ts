import { test, expect } from "vitest";

import { Id3v23ExtendedHeader, readId3v23ExtendedHeader } from "../3-extended-header";

test("read ID3v2.3 tag extended header", () => {
  const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00]);
  const tag: Id3v23ExtendedHeader = readId3v23ExtendedHeader(buffer, 0) as Id3v23ExtendedHeader;

  expect(tag).toEqual({
    size: 6,
    extendedFlags: 0,
    sizeOfPadding: 16,
    crcDataPresent: false,
    crcData: undefined,
  });
});

test("read ID3v2.3 tag extended header with CRC data", () => {
  const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x0a, 0x80, 0x00, 0x00, 0x00, 0x00, 0x10, 0x01, 0x02, 0x03, 0x04]);
  const tag: Id3v23ExtendedHeader = readId3v23ExtendedHeader(buffer, 0) as Id3v23ExtendedHeader;

  expect(tag).toEqual({
    size: 10,
    extendedFlags: 0x80_00,
    sizeOfPadding: 16,
    crcDataPresent: true,
    crcData: 0x01_02_03_04,
  });
});
