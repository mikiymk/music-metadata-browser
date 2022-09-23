import { expect, test, describe } from "vitest";

import { generateBuffer } from "../../../../../test/util";
import { fourCc } from "../fourcc";

describe("FourCC token", () => {
  const validCases: string[] = [
    "WAVE",
    "fmt ",
    "fmt\u0000",
    "----", // Used in MP4
    "-\u0000\u0000\u0000", // Used in MP4
    "©nam", // Used in MP4
    "(c) ", // Used in AIFF
  ];

  const invalidCases: string[] = ["\u0000\u0000\u0000\u0000", " XML", " XM "];

  test("FourCC token size = 4", () => {
    expect(fourCc[0]).toBe(4);
  });

  test.each(validCases)("%j is accept valid identifier", (data) => {
    const buf = generateBuffer(data);
    const actual = fourCc[1](buf, 0);
    expect(actual).toBe(data);
  });

  test.each(invalidCases)("%j is throw an error", (data) => {
    const buf = generateBuffer(data);

    expect(() => fourCc[1](buf, 0)).toThrowError(`FourCC contains invalid characters: "${data}"`);
  });
});
