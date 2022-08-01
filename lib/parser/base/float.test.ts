import { test, expect } from "vitest";
import { BufferTokenizer } from "../../strtok3/BufferTokenizer";
import {
  parseFloat16BigEndian,
  parseFloat16LittleEndian,
  parseFloat32BigEndian,
  parseFloat32LittleEndian,
  parseFloat64BigEndian,
  parseFloat64LittleEndian,
} from "./float";

test("decode 16 bit big endian floating point number", async () => {
  let buffer = Buffer.from([0b0101_0101, 0b0101_0010]);
  let tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat16BigEndian(tokenizer)).resolves.toBe(85.125);

  buffer = Buffer.from([0b1101_0101, 0b0101_0010]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat16BigEndian(tokenizer)).resolves.toBe(-85.125);

  buffer = Buffer.from([0b0011_1100, 0b0000_0000]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat16BigEndian(tokenizer)).resolves.toBe(1);

  buffer = Buffer.from([0b0000_0000, 0b0000_0000]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat16BigEndian(tokenizer)).resolves.toBe(0);

  buffer = Buffer.from([0b1111_1100, 0b0000_0000]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat16BigEndian(tokenizer)).resolves.toBe(Number.NEGATIVE_INFINITY);
});

test("decode 16 bit little endian floating point number", async () => {
  let buffer = Buffer.from([0b0101_0010, 0b0101_0101]);
  let tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat16LittleEndian(tokenizer)).resolves.toBe(85.125);

  buffer = Buffer.from([0b0101_0010, 0b1101_0101]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat16LittleEndian(tokenizer)).resolves.toBe(-85.125);

  buffer = Buffer.from([0b0000_0000, 0b0011_1100]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat16LittleEndian(tokenizer)).resolves.toBe(1);

  buffer = Buffer.from([0b0000_0000, 0b1000_0000]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat16LittleEndian(tokenizer)).resolves.toBe(-0);

  buffer = Buffer.from([0b0000_0000, 0b0111_1100]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat16LittleEndian(tokenizer)).resolves.toBe(Number.POSITIVE_INFINITY);
});

test("decode 32 bit big endian floating point number", async () => {
  let buffer = Buffer.from([0b0100_0010, 0b1010_1010, 0b0100_0000, 0b0000_0000]);
  let tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat32BigEndian(tokenizer)).resolves.toBe(85.125);

  buffer = Buffer.from([0b1100_0010, 0b1010_1010, 0b0100_0000, 0b0000_0000]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat32BigEndian(tokenizer)).resolves.toBe(-85.125);

  buffer = Buffer.from([0b0011_1111, 0b1000_0000, 0b0000_0000, 0b0000_0000]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat32BigEndian(tokenizer)).resolves.toBe(1);

  buffer = Buffer.from([0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat32BigEndian(tokenizer)).resolves.toBe(0);

  buffer = Buffer.from([0b1111_1111, 0b1000_0000, 0b0000_0000, 0b0000_0000]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat32BigEndian(tokenizer)).resolves.toBe(Number.NEGATIVE_INFINITY);
});

test("decode 32 bit little endian floating point number", async () => {
  let buffer = Buffer.from([0b0000_0000, 0b0100_0000, 0b1010_1010, 0b0100_0010]);
  let tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat32LittleEndian(tokenizer)).resolves.toBe(85.125);

  buffer = Buffer.from([0b0000_0000, 0b0100_0000, 0b1010_1010, 0b1100_0010]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat32LittleEndian(tokenizer)).resolves.toBe(-85.125);

  buffer = Buffer.from([0b0000_0000, 0b0000_0000, 0b1000_0000, 0b0011_1111]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat32LittleEndian(tokenizer)).resolves.toBe(1);

  buffer = Buffer.from([0b0000_0000, 0b0000_0000, 0b0000_0000, 0b1000_0000]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat32LittleEndian(tokenizer)).resolves.toBe(-0);

  buffer = Buffer.from([0b0000_0000, 0b0000_0000, 0b1000_0000, 0b0111_1111]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat32LittleEndian(tokenizer)).resolves.toBe(Number.POSITIVE_INFINITY);
});

test("decode 64 bit big endian floating point number", async () => {
  let buffer = Buffer.from([
    0b0100_0000, 0b0101_0101, 0b0100_1000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000,
  ]);
  let tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat64BigEndian(tokenizer)).resolves.toBe(85.125);

  buffer = Buffer.from([
    0b1100_0000, 0b0101_0101, 0b0100_1000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000,
  ]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat64BigEndian(tokenizer)).resolves.toBe(-85.125);

  buffer = Buffer.from([
    0b0011_1111, 0b1111_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000,
  ]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat64BigEndian(tokenizer)).resolves.toBe(1);

  buffer = Buffer.from([
    0b1000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000,
  ]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat64BigEndian(tokenizer)).resolves.toBe(-0);

  buffer = Buffer.from([
    0b0111_1111, 0b1111_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000,
  ]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat64BigEndian(tokenizer)).resolves.toBe(Number.POSITIVE_INFINITY);
});

test("decode 64 bit little endian floating point number", async () => {
  let buffer = Buffer.from([
    0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0100_1000, 0b0101_0101, 0b0100_0000,
  ]);
  let tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat64LittleEndian(tokenizer)).resolves.toBe(85.125);

  buffer = Buffer.from([
    0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0100_1000, 0b0101_0101, 0b1100_0000,
  ]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat64LittleEndian(tokenizer)).resolves.toBe(-85.125);

  buffer = Buffer.from([
    0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b1111_0000, 0b0011_1111,
  ]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat64LittleEndian(tokenizer)).resolves.toBe(1);

  buffer = Buffer.from([
    0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b1000_0000,
  ]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat64LittleEndian(tokenizer)).resolves.toBe(-0);

  buffer = Buffer.from([
    0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b1111_0000, 0b0111_1111,
  ]);
  tokenizer = new BufferTokenizer(buffer);
  await expect(parseFloat64LittleEndian(tokenizer)).resolves.toBe(Number.POSITIVE_INFINITY);
});
