import { test, expect } from "vitest";
import { BufferTokenizer } from "../../strtok3/BufferTokenizer";
import {
  parseUnsignedInt16BigEndian,
  parseUnsignedInt16LittleEndian,
  parseUnsignedInt24BigEndian,
  parseUnsignedInt24LittleEndian,
  parseUnsignedInt32BigEndian,
  parseUnsignedInt32LittleEndian,
  parseUnsignedInt64BigEndian,
  parseUnsignedInt64LittleEndian,
  parseUnsignedInt8,
} from "./unsigned-integer";

test("decode unsigned 8 bit integer", async () => {
  const buf = new Uint8Array([0x00, 0x01, 0x7f, 0x80, 0xff, 0x81]);
  const tokenizer = new BufferTokenizer(buf);

  expect(await parseUnsignedInt8(tokenizer)).toBe(0x00);
  expect(await parseUnsignedInt8(tokenizer)).toBe(0x01);
  expect(await parseUnsignedInt8(tokenizer)).toBe(0x7f);
  expect(await parseUnsignedInt8(tokenizer)).toBe(0x80);
  expect(await parseUnsignedInt8(tokenizer)).toBe(0xff);
  expect(await parseUnsignedInt8(tokenizer)).toBe(0x81);
});

test("decode unsigned 16 bit big endian integer", async () => {
  const buf = new Uint8Array([0x0a, 0x1a, 0x00, 0x00, 0xff, 0xff, 0x80, 0x00]);
  const tokenizer = new BufferTokenizer(buf);

  expect(await parseUnsignedInt16BigEndian(tokenizer)).toBe(0x0a_1a);
  expect(await parseUnsignedInt16BigEndian(tokenizer)).toBe(0x00_00);
  expect(await parseUnsignedInt16BigEndian(tokenizer)).toBe(0xff_ff);
  expect(await parseUnsignedInt16BigEndian(tokenizer)).toBe(0x80_00);
});

test("decode unsigned 16 bit little endian integer", async () => {
  const buf = new Uint8Array([0x1a, 0x0a, 0x00, 0x00, 0xff, 0xff, 0x00, 0x80]);
  const tokenizer = new BufferTokenizer(buf);

  expect(await parseUnsignedInt16LittleEndian(tokenizer)).toBe(0x0a_1a);
  expect(await parseUnsignedInt16LittleEndian(tokenizer)).toBe(0x00_00);
  expect(await parseUnsignedInt16LittleEndian(tokenizer)).toBe(0xff_ff);
  expect(await parseUnsignedInt16LittleEndian(tokenizer)).toBe(0x80_00);
});

test("decode unsigned 24 bit big endian integer", async () => {
  const buf = new Uint8Array([0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x10, 0x00, 0xff, 0x80, 0x00, 0x00]);
  const tokenizer = new BufferTokenizer(buf);

  expect(await parseUnsignedInt24BigEndian(tokenizer)).toBe(0x00_00_00);
  expect(await parseUnsignedInt24BigEndian(tokenizer)).toBe(0xff_ff_ff);
  expect(await parseUnsignedInt24BigEndian(tokenizer)).toBe(0x10_00_ff);
  expect(await parseUnsignedInt24BigEndian(tokenizer)).toBe(0x80_00_00);
});

test("decode unsigned 24 bit little endian integer", async () => {
  const buf = new Uint8Array([0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0x00, 0x10, 0x00, 0x00, 0x80]);
  const tokenizer = new BufferTokenizer(buf);

  expect(await parseUnsignedInt24LittleEndian(tokenizer)).toBe(0x00_00_00);
  expect(await parseUnsignedInt24LittleEndian(tokenizer)).toBe(0xff_ff_ff);
  expect(await parseUnsignedInt24LittleEndian(tokenizer)).toBe(0x10_00_ff);
  expect(await parseUnsignedInt24LittleEndian(tokenizer)).toBe(0x80_00_00);
});

test("decode unsigned 32 bit big endian integer", async () => {
  let buf = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]);
  let tokenizer = new BufferTokenizer(buf);

  expect(await parseUnsignedInt32BigEndian(tokenizer)).toBe(0x00_00_00_00);
  expect(await parseUnsignedInt32BigEndian(tokenizer)).toBe(0xff_ff_ff_ff);

  buf = new Uint8Array([0x00, 0x10, 0x00, 0xff, 0x80, 0x00, 0x00, 0x00]);
  tokenizer = new BufferTokenizer(buf);

  expect(await parseUnsignedInt32BigEndian(tokenizer)).toBe(0x00_10_00_ff);
  expect(await parseUnsignedInt32BigEndian(tokenizer)).toBe(0x80_00_00_00);
});

test("decode unsigned 32 bit little endian integer", async () => {
  let buf = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]);
  let tokenizer = new BufferTokenizer(buf);

  expect(await parseUnsignedInt32LittleEndian(tokenizer)).toBe(0x00_00_00_00);
  expect(await parseUnsignedInt32LittleEndian(tokenizer)).toBe(0xff_ff_ff_ff);

  buf = new Uint8Array([0xff, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x80]);
  tokenizer = new BufferTokenizer(buf);

  expect(await parseUnsignedInt32LittleEndian(tokenizer)).toBe(0x00_10_00_ff);
  expect(await parseUnsignedInt32LittleEndian(tokenizer)).toBe(0x80_00_00_00);
});

test("decode unsigned 64 bit big endian integer", async () => {
  let buf = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  let tokenizer = new BufferTokenizer(buf);
  expect(await parseUnsignedInt64BigEndian(tokenizer)).toBe(0x00_00_00_00_00_00_00_00n);

  buf = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
  tokenizer = new BufferTokenizer(buf);
  expect(await parseUnsignedInt64BigEndian(tokenizer)).toBe(0xff_ff_ff_ff_ff_ff_ff_ffn);

  buf = new Uint8Array([0x00, 0x00, 0xff, 0xbb, 0xee, 0xdd, 0xcc, 0xaa]);
  tokenizer = new BufferTokenizer(buf);
  expect(await parseUnsignedInt64BigEndian(tokenizer)).toBe(0x00_00_ff_bb_ee_dd_cc_aan);

  buf = new Uint8Array([0x00, 0x00, 0xff, 0xbb, 0xee, 0xdd, 0xcc, 0xbb]);
  tokenizer = new BufferTokenizer(buf);
  expect(await parseUnsignedInt64BigEndian(tokenizer)).toBe(0x00_00_ff_bb_ee_dd_cc_bbn);
});

test("decode unsigned 64 bit little endian integer", async () => {
  let buf = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  let tokenizer = new BufferTokenizer(buf);
  expect(await parseUnsignedInt64LittleEndian(tokenizer)).toBe(0x00_00_00_00_00_00_00_00n);

  buf = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
  tokenizer = new BufferTokenizer(buf);
  expect(await parseUnsignedInt64LittleEndian(tokenizer)).toBe(0xff_ff_ff_ff_ff_ff_ff_ffn);

  buf = new Uint8Array([0xaa, 0xcc, 0xdd, 0xee, 0xbb, 0xff, 0x00, 0x00]);
  tokenizer = new BufferTokenizer(buf);
  expect(await parseUnsignedInt64LittleEndian(tokenizer)).toBe(0x00_00_ff_bb_ee_dd_cc_aan);

  buf = new Uint8Array([0xbb, 0xcc, 0xdd, 0xee, 0xbb, 0xff, 0x00, 0x00]);
  tokenizer = new BufferTokenizer(buf);
  expect(await parseUnsignedInt64LittleEndian(tokenizer)).toBe(0x00_00_ff_bb_ee_dd_cc_bbn);
});
