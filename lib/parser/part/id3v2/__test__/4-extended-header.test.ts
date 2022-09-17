import { test, expect } from "vitest";

import { Id3v24ExtendedHeader, readId3v24ExtendedHeader } from "../4-extended-header";

test("read ID3v2.4 tag extended header", () => {
  const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x06, 0x01, 0b0000_0000]);
  const tag: Id3v24ExtendedHeader = readId3v24ExtendedHeader(buffer, 0) as Id3v24ExtendedHeader;

  expect(tag).toEqual({
    size: 6,

    flags: {
      tagIsUpdate: false,
      crcDataPresent: false,
      tagRestrictions: false,
    },

    crcData: undefined,
    restrictions: undefined,
  });
});

test("read ID3v2.4 tag extended header: set 'tag is update'", () => {
  const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x07, 0x01, 0b0100_0000, 0x00]);
  const tag: Id3v24ExtendedHeader = readId3v24ExtendedHeader(buffer, 0) as Id3v24ExtendedHeader;

  expect(tag).toEqual({
    size: 7,

    flags: {
      tagIsUpdate: true,
      crcDataPresent: false,
      tagRestrictions: false,
    },

    crcData: undefined,
    restrictions: undefined,
  });
});

test("read ID3v2.4 tag extended header: set 'CRC data present'", () => {
  const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x0c, 0x01, 0b0010_0000, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05]);
  const tag: Id3v24ExtendedHeader = readId3v24ExtendedHeader(buffer, 0) as Id3v24ExtendedHeader;

  expect(tag).toEqual({
    size: 12,

    flags: {
      tagIsUpdate: false,
      crcDataPresent: true,
      tagRestrictions: false,
    },

    crcData: new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]),
    restrictions: undefined,
  });
});

test("read ID3v2.4 tag extended header: set 'tag restrictions'", () => {
  const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x08, 0x01, 0b0001_0000, 0x01, 0b1010_1010]);
  const tag: Id3v24ExtendedHeader = readId3v24ExtendedHeader(buffer, 0) as Id3v24ExtendedHeader;

  expect(tag).toEqual({
    size: 8,

    flags: {
      tagIsUpdate: false,
      crcDataPresent: false,
      tagRestrictions: true,
    },

    crcData: undefined,
    restrictions: {
      tagSize: 2,
      textEncoding: 1,
      textFieldSize: 1,
      imageEncoding: 0,
      imageSize: 2,
    },
  });
});

test("read ID3v2.4 tag extended header: set all tags", () => {
  const buffer = new Uint8Array([
    0x00, 0x00, 0x00, 0x0f, 0x01, 0b0111_0000, 0x00, 0x05, 0xfe, 0xdc, 0xba, 0x98, 0x76, 0x01, 0xff,
  ]);
  const tag: Id3v24ExtendedHeader = readId3v24ExtendedHeader(buffer, 0) as Id3v24ExtendedHeader;

  expect(tag).toEqual({
    size: 15,

    flags: {
      tagIsUpdate: true,
      crcDataPresent: true,
      tagRestrictions: true,
    },

    crcData: new Uint8Array([0xfe, 0xdc, 0xba, 0x98, 0x76]),
    restrictions: {
      tagSize: 3,
      textEncoding: 1,
      textFieldSize: 3,
      imageEncoding: 1,
      imageSize: 3,
    },
  });
});
