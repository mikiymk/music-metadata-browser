import { test, expect } from "vitest";

import { generateBuffer } from "../../../../test/util";
import { f16be, f16le, f32be, f32le, f64be, f64le } from "../float";

test("decode 16 bit big endian floating point number", () => {
  const buffer = generateBuffer(
    [0b0101_0101, 0b0101_0010],
    [0b1101_0101, 0b0101_0010],
    [0b0011_1100, 0b0000_0000],
    [0b0000_0000, 0b0000_0000],
    [0b1000_0000, 0b0000_0000],
    [0b0111_1100, 0b0000_0000],
    [0b1111_1100, 0b0000_0000],
    [0b0111_1100, 0b0000_0001]
  );
  const [size, reader] = f16be;

  expect(reader(buffer, size * 0)).toBe(85.125);
  expect(reader(buffer, size * 1)).toBe(-85.125);
  expect(reader(buffer, size * 2)).toBe(1);
  expect(reader(buffer, size * 3)).toBe(0);
  expect(reader(buffer, size * 4)).toBe(-0);
  expect(reader(buffer, size * 5)).toBe(Number.POSITIVE_INFINITY);
  expect(reader(buffer, size * 6)).toBe(Number.NEGATIVE_INFINITY);
  expect(reader(buffer, size * 7)).toBe(Number.NaN);
});

test("decode 16 bit little endian floating point number", () => {
  const buffer = generateBuffer(
    [0b0101_0010, 0b0101_0101],
    [0b0101_0010, 0b1101_0101],
    [0b0000_0000, 0b0011_1100],
    [0b0000_0000, 0b0000_0000],
    [0b0000_0000, 0b1000_0000],
    [0b0000_0000, 0b0111_1100],
    [0b0000_0000, 0b1111_1100],
    [0b0000_0001, 0b0111_1100]
  );
  const [size, reader] = f16le;

  expect(reader(buffer, size * 0)).toBe(85.125);
  expect(reader(buffer, size * 1)).toBe(-85.125);
  expect(reader(buffer, size * 2)).toBe(1);
  expect(reader(buffer, size * 3)).toBe(0);
  expect(reader(buffer, size * 4)).toBe(-0);
  expect(reader(buffer, size * 5)).toBe(Number.POSITIVE_INFINITY);
  expect(reader(buffer, size * 6)).toBe(Number.NEGATIVE_INFINITY);
  expect(reader(buffer, size * 7)).toBe(Number.NaN);
});

test("decode 32 bit big endian floating point number", () => {
  const buffer = generateBuffer(
    [0b0100_0010, 0b1010_1010, 0b0100_0000, 0b0000_0000],
    [0b1100_0010, 0b1010_1010, 0b0100_0000, 0b0000_0000],
    [0b0011_1111, 0b1000_0000, 0b0000_0000, 0b0000_0000],
    [0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000],
    [0b1000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000],
    [0b0111_1111, 0b1000_0000, 0b0000_0000, 0b0000_0000],
    [0b1111_1111, 0b1000_0000, 0b0000_0000, 0b0000_0000],
    [0b0111_1111, 0b1000_0000, 0b0000_0000, 0b0000_0001]
  );
  const [size, reader] = f32be;

  expect(reader(buffer, size * 0)).toBe(85.125);
  expect(reader(buffer, size * 1)).toBe(-85.125);
  expect(reader(buffer, size * 2)).toBe(1);
  expect(reader(buffer, size * 3)).toBe(0);
  expect(reader(buffer, size * 4)).toBe(-0);
  expect(reader(buffer, size * 5)).toBe(Number.POSITIVE_INFINITY);
  expect(reader(buffer, size * 6)).toBe(Number.NEGATIVE_INFINITY);
  expect(reader(buffer, size * 7)).toBe(Number.NaN);
});

test("decode 32 bit little endian floating point number", () => {
  const buffer = generateBuffer(
    [0b0000_0000, 0b0100_0000, 0b1010_1010, 0b0100_0010],
    [0b0000_0000, 0b0100_0000, 0b1010_1010, 0b1100_0010],
    [0b0000_0000, 0b0000_0000, 0b1000_0000, 0b0011_1111],
    [0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000],
    [0b0000_0000, 0b0000_0000, 0b0000_0000, 0b1000_0000],
    [0b0000_0000, 0b0000_0000, 0b1000_0000, 0b0111_1111],
    [0b0000_0000, 0b0000_0000, 0b1000_0000, 0b1111_1111],
    [0b0000_0001, 0b0000_0000, 0b1000_0000, 0b0111_1111]
  );
  const [size, reader] = f32le;

  expect(reader(buffer, size * 0)).toBe(85.125);
  expect(reader(buffer, size * 1)).toBe(-85.125);
  expect(reader(buffer, size * 2)).toBe(1);
  expect(reader(buffer, size * 3)).toBe(0);
  expect(reader(buffer, size * 4)).toBe(-0);
  expect(reader(buffer, size * 5)).toBe(Number.POSITIVE_INFINITY);
  expect(reader(buffer, size * 6)).toBe(Number.NEGATIVE_INFINITY);
  expect(reader(buffer, size * 7)).toBe(Number.NaN);
});

test("decode 64 bit big endian floating point number", () => {
  const buffer = generateBuffer(
    [0b0100_0000, 0b0101_0101, 0b0100_1000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000],
    [0b1100_0000, 0b0101_0101, 0b0100_1000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000],
    [0b0011_1111, 0b1111_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000],
    [0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000],
    [0b1000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000],
    [0b0111_1111, 0b1111_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000],
    [0b1111_1111, 0b1111_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000],
    [0b0111_1111, 0b1111_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0001]
  );
  const [size, reader] = f64be;

  expect(reader(buffer, size * 0)).toBe(85.125);
  expect(reader(buffer, size * 1)).toBe(-85.125);
  expect(reader(buffer, size * 2)).toBe(1);
  expect(reader(buffer, size * 3)).toBe(0);
  expect(reader(buffer, size * 4)).toBe(-0);
  expect(reader(buffer, size * 5)).toBe(Number.POSITIVE_INFINITY);
  expect(reader(buffer, size * 6)).toBe(Number.NEGATIVE_INFINITY);
  expect(reader(buffer, size * 7)).toBe(Number.NaN);
});

test("decode 64 bit little endian floating point number", () => {
  const buffer = generateBuffer(
    [0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0100_1000, 0b0101_0101, 0b0100_0000],
    [0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0100_1000, 0b0101_0101, 0b1100_0000],
    [0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b1111_0000, 0b0011_1111],
    [0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000],
    [0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b1000_0000],
    [0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b1111_0000, 0b0111_1111],
    [0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b1111_0000, 0b1111_1111],
    [0b0000_0001, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b0000_0000, 0b1111_0000, 0b0111_1111]
  );
  const [size, reader] = f64le;

  expect(reader(buffer, size * 0)).toBe(85.125);
  expect(reader(buffer, size * 1)).toBe(-85.125);
  expect(reader(buffer, size * 2)).toBe(1);
  expect(reader(buffer, size * 3)).toBe(0);
  expect(reader(buffer, size * 4)).toBe(-0);
  expect(reader(buffer, size * 5)).toBe(Number.POSITIVE_INFINITY);
  expect(reader(buffer, size * 6)).toBe(Number.NEGATIVE_INFINITY);
  expect(reader(buffer, size * 7)).toBe(Number.NaN);
});
