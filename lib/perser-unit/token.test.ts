import { describe, expect, test } from "vitest";

import { seq, map, seqMap, toObj } from "./token";

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

// 勝ち
type A<T extends [] | any[], U extends { [key in keyof T as key extends number ? string : never]: key }> = {
  [key in keyof U]: U[key] extends keyof T ? T[U[key]] : never;
};

type B = A<[number, string, boolean], { a: 0; b: 1; c: 2 }>;
