import { test, expect } from "vitest";

import { isBitSet } from "../bit";

test("bit is setted", () => {
  expect(isBitSet(0b0011_0011, 0)).toBe(true);
  expect(isBitSet(0b0011_0011, 1)).toBe(true);
  expect(isBitSet(0b0011_0011, 2)).toBe(false);
  expect(isBitSet(0b0011_0011, 3)).toBe(false);
  expect(isBitSet(0b0011_0011, 4)).toBe(true);
  expect(isBitSet(0b0011_0011, 5)).toBe(true);
  expect(isBitSet(0b0011_0011, 6)).toBe(false);
  expect(isBitSet(0b0011_0011, 7)).toBe(false);
});

test("32bit number bit is setted", () => {
  expect(isBitSet(0b1010_0000_0000_0000_0000_0000_0000_0000, 31)).toBe(true);
  expect(isBitSet(0b1010_0000_0000_0000_0000_0000_0000_0000, 30)).toBe(false);
  expect(isBitSet(0b1010_0000_0000_0000_0000_0000_0000_0000, 29)).toBe(true);
  expect(isBitSet(0b1010_0000_0000_0000_0000_0000_0000_0000, 28)).toBe(false);
});
