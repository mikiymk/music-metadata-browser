import { test, expect } from "vitest";

import { ID3V2_HEADER_SIZE, readId3v2Header, type Id3v2Header } from "../header";

test("ID3v2 tag header size is 128 bytes", () => {
  expect(ID3V2_HEADER_SIZE).toBe(10);
});

test("read ID3v2.2 tag header", () => {
  const buffer = new Uint8Array([0x49, 0x44, 0x33, 0x02, 0x00, 0xc0, 0x7f, 0x7f, 0x7f, 0x7f]);
  const tag: Id3v2Header = readId3v2Header(buffer, 0) as Id3v2Header;

  expect(tag).toEqual({
    id: "ID3",

    versionMajor: 2,
    versionRevision: 0,

    unsynchronisation: true,
    isExtendedHeader: true,
    expIndicator: false,
    footer: false,

    size: 0x0f_ff_ff_ff,
  });
});

test("read ID3v2.3 tag header", () => {
  const buffer = new Uint8Array([0x49, 0x44, 0x33, 0x03, 0x00, 0xe0, 0x7f, 0x7f, 0x7f, 0x7f]);
  const tag: Id3v2Header = readId3v2Header(buffer, 0) as Id3v2Header;

  expect(tag).toEqual({
    id: "ID3",

    versionMajor: 3,
    versionRevision: 0,

    unsynchronisation: true,
    isExtendedHeader: true,
    expIndicator: true,
    footer: false,

    size: 0x0f_ff_ff_ff,
  });
});

test("read ID3v2.4 tag header", () => {
  const buffer = new Uint8Array([0x49, 0x44, 0x33, 0x04, 0x00, 0xf0, 0x7f, 0x7f, 0x7f, 0x7f]);
  const tag: Id3v2Header = readId3v2Header(buffer, 0) as Id3v2Header;

  expect(tag).toEqual({
    id: "ID3",

    versionMajor: 4,
    versionRevision: 0,

    unsynchronisation: true,
    isExtendedHeader: true,
    expIndicator: true,
    footer: true,

    size: 0x0f_ff_ff_ff,
  });
});
