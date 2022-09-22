import { test, expect } from "vitest";

import { i8, i16be, i16le, i24be, i24le, i32be, i32le, i64be, i64le } from "../signed-integer";

test("decode signed 8 bit integer", () => {
  const buffer = new Uint8Array([0x00, 0x01, 0x7f, 0x80, 0xff, 0x81]);
  const [size, reader] = i8;

  expect(reader(buffer, size * 0)).toBe(0x00);
  expect(reader(buffer, size * 1)).toBe(0x01);
  expect(reader(buffer, size * 2)).toBe(0x7f);
  expect(reader(buffer, size * 3)).toBe(-128);
  expect(reader(buffer, size * 4)).toBe(-1);
  expect(reader(buffer, size * 5)).toBe(-127);
});

test("decode signed 16 bit big endian integer", () => {
  const buffer = new Uint8Array([0x0a, 0x1a, 0x00, 0x00, 0xff, 0xff, 0x80, 0x00]);
  const [size, reader] = i16be;

  expect(reader(buffer, size * 0)).toBe(2586);
  expect(reader(buffer, size * 1)).toBe(0);
  expect(reader(buffer, size * 2)).toBe(-1);
  expect(reader(buffer, size * 3)).toBe(-32_768);
});

test("decode signed 16 bit little endian integer", () => {
  const buffer = new Uint8Array([0x1a, 0x0a, 0x00, 0x00, 0xff, 0xff, 0x00, 0x80]);
  const [size, reader] = i16le;

  expect(reader(buffer, size * 0)).toBe(2586);
  expect(reader(buffer, size * 1)).toBe(0);
  expect(reader(buffer, size * 2)).toBe(-1);
  expect(reader(buffer, size * 3)).toBe(-32_768);
});

test("decode signed 24 bit big endian integer", () => {
  const buffer = new Uint8Array([0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x10, 0x00, 0xff, 0x80, 0x00, 0x00]);
  const [size, reader] = i24be;

  expect(reader(buffer, size * 0)).toBe(0);
  expect(reader(buffer, size * 1)).toBe(-1);
  expect(reader(buffer, size * 2)).toBe(1_048_831);
  expect(reader(buffer, size * 3)).toBe(-8_388_608);
});

test("decode signed 24 bit little endian integer", () => {
  const buffer = new Uint8Array([0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0x00, 0x10, 0x00, 0x00, 0x80]);
  const [size, reader] = i24le;

  expect(reader(buffer, size * 0)).toBe(0);
  expect(reader(buffer, size * 1)).toBe(-1);
  expect(reader(buffer, size * 2)).toBe(1_048_831);
  expect(reader(buffer, size * 3)).toBe(-8_388_608);
});

test("decode signed 32 bit big endian integer", () => {
  const buffer = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0x00, 0x10, 0x00, 0xff, 0x80, 0x00, 0x00, 0x00,
  ]);
  const [size, reader] = i32be;

  expect(reader(buffer, size * 0)).toBe(0);
  expect(reader(buffer, size * 1)).toBe(-1);
  expect(reader(buffer, size * 2)).toBe(1_048_831);
  expect(reader(buffer, size * 3)).toBe(-2_147_483_648);
});

test("decode signed 32 bit little endian integer", () => {
  const buffer = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x80,
  ]);
  const [size, reader] = i32le;

  expect(reader(buffer, size * 0)).toBe(0);
  expect(reader(buffer, size * 1)).toBe(-1);
  expect(reader(buffer, size * 2)).toBe(1_048_831);
  expect(reader(buffer, size * 3)).toBe(-2_147_483_648);
});

test("decode signed 64 bit big endian integer", () => {
  const buffer = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0xff,
    0xbb, 0xee, 0xdd, 0xcc, 0xaa, 0x00, 0x00, 0xff, 0xbb, 0xee, 0xdd, 0xcc, 0xbb,
  ]);
  const [size, reader] = i64be;

  expect(reader(buffer, size * 0)).toBe(0n);
  expect(reader(buffer, size * 1)).toBe(-1n);
  expect(reader(buffer, size * 2)).toBe(0x00_00_ff_bb_ee_dd_cc_aan);
  expect(reader(buffer, size * 3)).toBe(0x00_00_ff_bb_ee_dd_cc_bbn);
});

test("decode signed 64 bit little endian integer", () => {
  const buffer = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xaa, 0xcc, 0xdd,
    0xee, 0xbb, 0xff, 0x00, 0x00, 0xbb, 0xcc, 0xdd, 0xee, 0xbb, 0xff, 0x00, 0x00,
  ]);
  const [size, reader] = i64le;

  expect(reader(buffer, size * 0)).toBe(0n);
  expect(reader(buffer, size * 1)).toBe(-1n);
  expect(reader(buffer, size * 2)).toBe(0x00_00_ff_bb_ee_dd_cc_aan);
  expect(reader(buffer, size * 3)).toBe(0x00_00_ff_bb_ee_dd_cc_bbn);
});
