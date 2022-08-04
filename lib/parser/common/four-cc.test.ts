import { describe, test, expect } from "vitest";
import { BufferTokenizer } from "../../strtok3/BufferTokenizer";
import { parseFourCC } from "./four-cc";

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

describe("FourCC token", () => {
  test.each(validCases)("%j is accept valid identifier", async (data) => {
    const buf = Buffer.from(data, "ascii");
    const tokenizer = new BufferTokenizer(buf);

    const actual = parseFourCC(tokenizer);
    await expect(actual).resolves.toBe(data);
  });

  test.each(invalidCases)("%j is throw an error", async (data) => {
    const buf = Buffer.from(data, "ascii");
    const tokenizer = new BufferTokenizer(buf);

    await expect(() => parseFourCC(tokenizer)).rejects.toThrow();
  });
});
