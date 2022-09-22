import { test, expect } from "vitest";

import { generateBuffer } from "../../../../test/util";
import { bits } from "../bit";

test("bits size = 1", () => {
  expect(bits()[0]).toBe(1);
});

test("bit is set", () => {
  const buffer = generateBuffer(0b0000_0000, 0b0000_0010, 0b0000_1000, 0b0000_1010);
  const parser = bits(1, 3)[1];
  expect(parser(buffer, 0)).toEqual([false, false]);
  expect(parser(buffer, 1)).toEqual([true, false]);
  expect(parser(buffer, 2)).toEqual([false, true]);
  expect(parser(buffer, 3)).toEqual([true, true]);
});
