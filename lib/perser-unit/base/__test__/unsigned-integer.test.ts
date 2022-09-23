import { test, expect } from "vitest";

import { u8, u16be, u16le, u24be, u24le, u32be, u32le, u64be, u64le } from "../unsigned-integer";

test("decode unsigned 8 bit integer", () => {
  const [size, reader] = u8;
  const buffer = new Uint8Array([0x00, 0x01, 0x7f, 0x80, 0xff, 0x81]);

  expect(reader(buffer, size * 0)).toBe(0x00);
  expect(reader(buffer, size * 1)).toBe(0x01);
  expect(reader(buffer, size * 2)).toBe(0x7f);
  expect(reader(buffer, size * 3)).toBe(0x80);
  expect(reader(buffer, size * 4)).toBe(0xff);
  expect(reader(buffer, size * 5)).toBe(0x81);
});

test("decode unsigned 16 bit big endian integer", () => {
  const [size, reader] = u16be;
  const buffer = new Uint8Array([0x0a, 0x1a, 0x00, 0x00, 0xff, 0xff, 0x80, 0x00]);

  expect(reader(buffer, size * 0)).toBe(0x0a_1a);
  expect(reader(buffer, size * 1)).toBe(0x00_00);
  expect(reader(buffer, size * 2)).toBe(0xff_ff);
  expect(reader(buffer, size * 3)).toBe(0x80_00);
});

test("decode unsigned 16 bit little endian integer", () => {
  const [size, reader] = u16le;
  const buffer = new Uint8Array([0x1a, 0x0a, 0x00, 0x00, 0xff, 0xff, 0x00, 0x80]);

  expect(reader(buffer, size * 0)).toBe(0x0a_1a);
  expect(reader(buffer, size * 1)).toBe(0x00_00);
  expect(reader(buffer, size * 2)).toBe(0xff_ff);
  expect(reader(buffer, size * 3)).toBe(0x80_00);
});

test("decode unsigned 24 bit big endian integer", () => {
  const [size, reader] = u24be;
  const buffer = new Uint8Array([0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x10, 0x00, 0xff, 0x80, 0x00, 0x00]);

  expect(reader(buffer, size * 0)).toBe(0x00_00_00);
  expect(reader(buffer, size * 1)).toBe(0xff_ff_ff);
  expect(reader(buffer, size * 2)).toBe(0x10_00_ff);
  expect(reader(buffer, size * 3)).toBe(0x80_00_00);
});

test("decode unsigned 24 bit little endian integer", () => {
  const [size, reader] = u24le;
  const buffer = new Uint8Array([0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0x00, 0x10, 0x00, 0x00, 0x80]);

  expect(reader(buffer, size * 0)).toBe(0x00_00_00);
  expect(reader(buffer, size * 1)).toBe(0xff_ff_ff);
  expect(reader(buffer, size * 2)).toBe(0x10_00_ff);
  expect(reader(buffer, size * 3)).toBe(0x80_00_00);
});

test("decode unsigned 32 bit big endian integer", () => {
  const [size, reader] = u32be;
  const buffer = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0x00, 0x10, 0x00, 0xff, 0x80, 0x00, 0x00, 0x00,
  ]);

  expect(reader(buffer, size * 0)).toBe(0x00_00_00_00);
  expect(reader(buffer, size * 1)).toBe(0xff_ff_ff_ff);
  expect(reader(buffer, size * 2)).toBe(0x00_10_00_ff);
  expect(reader(buffer, size * 3)).toBe(0x80_00_00_00);
});

test("decode unsigned 32 bit little endian integer", () => {
  const [size, reader] = u32le;
  const buffer = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x80,
  ]);

  expect(reader(buffer, size * 0)).toBe(0x00_00_00_00);
  expect(reader(buffer, size * 1)).toBe(0xff_ff_ff_ff);
  expect(reader(buffer, size * 2)).toBe(0x00_10_00_ff);
  expect(reader(buffer, size * 3)).toBe(0x80_00_00_00);
});

test("decode unsigned 64 bit big endian integer", () => {
  const [size, reader] = u64be;
  const buffer = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0xff,
    0xbb, 0xee, 0xdd, 0xcc, 0xaa, 0x00, 0x00, 0xff, 0xbb, 0xee, 0xdd, 0xcc, 0xbb,
  ]);

  expect(reader(buffer, size * 0)).toBe(0x00_00_00_00_00_00_00_00n);
  expect(reader(buffer, size * 1)).toBe(0xff_ff_ff_ff_ff_ff_ff_ffn);
  expect(reader(buffer, size * 2)).toBe(0x00_00_ff_bb_ee_dd_cc_aan);
  expect(reader(buffer, size * 3)).toBe(0x00_00_ff_bb_ee_dd_cc_bbn);
});

test("decode unsigned 64 bit little endian integer", () => {
  const [size, reader] = u64le;
  const buffer = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xaa, 0xcc, 0xdd,
    0xee, 0xbb, 0xff, 0x00, 0x00, 0xbb, 0xcc, 0xdd, 0xee, 0xbb, 0xff, 0x00, 0x00,
  ]);

  expect(reader(buffer, size * 0)).toBe(0x00_00_00_00_00_00_00_00n);
  expect(reader(buffer, size * 1)).toBe(0xff_ff_ff_ff_ff_ff_ff_ffn);
  expect(reader(buffer, size * 2)).toBe(0x00_00_ff_bb_ee_dd_cc_aan);
  expect(reader(buffer, size * 3)).toBe(0x00_00_ff_bb_ee_dd_cc_bbn);
});
