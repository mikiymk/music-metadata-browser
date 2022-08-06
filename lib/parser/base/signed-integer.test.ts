import { test, expect } from "vitest";
import { BufferByteReader } from "../../byte-reader/buffer-byte-reader";
import {
  parseSignedInt16BigEndian,
  parseSignedInt16LittleEndian,
  parseSignedInt24BigEndian,
  parseSignedInt24LittleEndian,
  parseSignedInt32BigEndian,
  parseSignedInt32LittleEndian,
  parseSignedInt64BigEndian,
  parseSignedInt64LittleEndian,
  parseSignedInt8,
} from "./signed-integer";

test("decode signed 8 bit integer", async () => {
  const buf = new Uint8Array([0x00, 0x01, 0x7f, 0x80, 0xff, 0x81]);
  const tokenizer = new BufferByteReader(buf);

  expect(await parseSignedInt8(tokenizer)).toBe(0);
  expect(await parseSignedInt8(tokenizer)).toBe(1);
  expect(await parseSignedInt8(tokenizer)).toBe(127);
  expect(await parseSignedInt8(tokenizer)).toBe(-128);
  expect(await parseSignedInt8(tokenizer)).toBe(-1);
  expect(await parseSignedInt8(tokenizer)).toBe(-127);
});

test("decode signed 16 bit big endian integer", async () => {
  const buf = new Uint8Array([0x0a, 0x1a, 0x00, 0x00, 0xff, 0xff, 0x80, 0x00]);
  const tokenizer = new BufferByteReader(buf);

  expect(await parseSignedInt16BigEndian(tokenizer)).toBe(2586);
  expect(await parseSignedInt16BigEndian(tokenizer)).toBe(0);
  expect(await parseSignedInt16BigEndian(tokenizer)).toBe(-1);
  expect(await parseSignedInt16BigEndian(tokenizer)).toBe(-32_768);
});

test("decode signed 16 bit little endian integer", async () => {
  const buf = new Uint8Array([0x1a, 0x0a, 0x00, 0x00, 0xff, 0xff, 0x00, 0x80]);
  const tokenizer = new BufferByteReader(buf);

  expect(await parseSignedInt16LittleEndian(tokenizer)).toBe(2586);
  expect(await parseSignedInt16LittleEndian(tokenizer)).toBe(0);
  expect(await parseSignedInt16LittleEndian(tokenizer)).toBe(-1);
  expect(await parseSignedInt16LittleEndian(tokenizer)).toBe(-32_768);
});

test("decode signed 24 bit big endian integer", async () => {
  const buf = new Uint8Array([0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x10, 0x00, 0xff, 0x80, 0x00, 0x00]);
  const tokenizer = new BufferByteReader(buf);

  expect(await parseSignedInt24BigEndian(tokenizer)).toBe(0);
  expect(await parseSignedInt24BigEndian(tokenizer)).toBe(-1);
  expect(await parseSignedInt24BigEndian(tokenizer)).toBe(1_048_831);
  expect(await parseSignedInt24BigEndian(tokenizer)).toBe(-8_388_608);
});

test("decode signed 24 bit little endian integer", async () => {
  const buf = new Uint8Array([0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0x00, 0x10, 0x00, 0x00, 0x80]);
  const tokenizer = new BufferByteReader(buf);

  expect(await parseSignedInt24LittleEndian(tokenizer)).toBe(0);
  expect(await parseSignedInt24LittleEndian(tokenizer)).toBe(-1);
  expect(await parseSignedInt24LittleEndian(tokenizer)).toBe(1_048_831);
  expect(await parseSignedInt24LittleEndian(tokenizer)).toBe(-8_388_608);
});

test("decode signed 32 bit big endian integer", async () => {
  let buf = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]);
  let tokenizer = new BufferByteReader(buf);

  expect(await parseSignedInt32BigEndian(tokenizer)).toBe(0);
  expect(await parseSignedInt32BigEndian(tokenizer)).toBe(-1);

  buf = new Uint8Array([0x00, 0x10, 0x00, 0xff, 0x80, 0x00, 0x00, 0x00]);
  tokenizer = new BufferByteReader(buf);

  expect(await parseSignedInt32BigEndian(tokenizer)).toBe(1_048_831);
  expect(await parseSignedInt32BigEndian(tokenizer)).toBe(-2_147_483_648);
});

test("decode signed 32 bit little endian integer", async () => {
  let buf = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]);
  let tokenizer = new BufferByteReader(buf);

  expect(await parseSignedInt32LittleEndian(tokenizer)).toBe(0);
  expect(await parseSignedInt32LittleEndian(tokenizer)).toBe(-1);

  buf = new Uint8Array([0xff, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x80]);
  tokenizer = new BufferByteReader(buf);

  expect(await parseSignedInt32LittleEndian(tokenizer)).toBe(1_048_831);
  expect(await parseSignedInt32LittleEndian(tokenizer)).toBe(-2_147_483_648);
});

test("decode signed 64 bit big endian integer", async () => {
  let buf = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  let tokenizer = new BufferByteReader(buf);
  expect(await parseSignedInt64BigEndian(tokenizer)).toBe(0n);

  buf = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
  tokenizer = new BufferByteReader(buf);
  expect(await parseSignedInt64BigEndian(tokenizer)).toBe(-1n);

  buf = new Uint8Array([0x00, 0x00, 0xff, 0xbb, 0xee, 0xdd, 0xcc, 0xaa]);
  tokenizer = new BufferByteReader(buf);
  expect(await parseSignedInt64BigEndian(tokenizer)).toBe(0x00_00_ff_bb_ee_dd_cc_aan);

  buf = new Uint8Array([0x00, 0x00, 0xff, 0xbb, 0xee, 0xdd, 0xcc, 0xbb]);
  tokenizer = new BufferByteReader(buf);
  expect(await parseSignedInt64BigEndian(tokenizer)).toBe(0x00_00_ff_bb_ee_dd_cc_bbn);
});

test("decode signed 64 bit little endian integer", async () => {
  let buf = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  let tokenizer = new BufferByteReader(buf);
  expect(await parseSignedInt64LittleEndian(tokenizer)).toBe(0n);

  buf = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
  tokenizer = new BufferByteReader(buf);
  expect(await parseSignedInt64LittleEndian(tokenizer)).toBe(-1n);

  buf = new Uint8Array([0xaa, 0xcc, 0xdd, 0xee, 0xbb, 0xff, 0x00, 0x00]);
  tokenizer = new BufferByteReader(buf);
  expect(await parseSignedInt64LittleEndian(tokenizer)).toBe(0x00_00_ff_bb_ee_dd_cc_aan);

  buf = new Uint8Array([0xbb, 0xcc, 0xdd, 0xee, 0xbb, 0xff, 0x00, 0x00]);
  tokenizer = new BufferByteReader(buf);
  expect(await parseSignedInt64LittleEndian(tokenizer)).toBe(0x00_00_ff_bb_ee_dd_cc_bbn);
});
