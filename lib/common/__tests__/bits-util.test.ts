import { test, expect, describe } from "vitest";

import { getBitsNumber } from "../bits-util";

describe("bits aligned number", () => {
  type Case = [description: string, value: number, offset: number, length: number, expected: number];
  const cases: Case[] = [
    ["get bits number", 0b0000_0000_0000_0000_0000_1111_0000_0000, 8, 4, 0b1111],
    ["reach to left end", 0b1111_0000_0000_0000_0000_0000_0000_0000, 28, 4, 0b1111],
    ["reach to right end", 0b0000_0000_0000_0000_0000_0000_0000_1111, 0, 4, 0b1111],
    [
      "reach to left and right end",
      0b1111_1111_1111_1111_1111_1111_1111_1111,
      0,
      32,
      0b1111_1111_1111_1111_1111_1111_1111_1111,
    ],
  ];

  test.each(cases)("%s", (_, value, offset, length, expected) => {
    const result = getBitsNumber(value, offset, length);

    expect(result).toEqual(expected);
  });
});
