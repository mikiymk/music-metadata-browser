import { describe, expect, test } from "vitest";

import { u8 } from "./base/unsigned-integer";
import { seq, map, seqMap } from "./token";

describe("sequence", () => {
  test("seq 0 = size 0", () => {
    expect(seq()[0]).toBe(0);
  });

  test("seq 2, 3, 4 = size 9", () => {
    const [size, reader] = seq([2, () => 4], [3, () => 9], [4, () => 16]);
    expect(size).toBe(9);
    expect(reader(new Uint8Array(), 0)).toEqual([4, 9, 16]);
  });
});

describe("map", () => {
  const [size, reader] = map(u8, (v) => v + 1);

  test("map size = size", () => {
    expect(size).toBe(u8[0]);
  });

  test("map value changes", () => {
    expect(reader(new Uint8Array([1, 4, 9]), 0)).toBe(2);
  });
});

describe("sequence map", () => {
  const [size, reader] = seqMap((a, b, c) => a + b + c + 1, u8, u8, u8);

  test("map size = size", () => {
    expect(size).toBe(u8[0] + u8[0] + u8[0]);
  });

  test("map value changes", () => {
    expect(reader(new Uint8Array([1, 2, 3]), 0)).toBe(7);
  });
});
