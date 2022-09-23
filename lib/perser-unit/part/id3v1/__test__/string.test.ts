import { test, expect, describe } from "vitest";

import { id3v1String } from "../string";

describe("read ID3v1 string", () => {
  test("empty string", () => {
    const buffer = new Uint8Array([0x00]);
    const [, reader] = id3v1String(1);
    const result = reader(buffer, 0);

    expect(result).toBe("");
  });

  test("null terminated string", () => {
    const buffer = new Uint8Array([0x41, 0x62, 0x63, 0x00]);
    const [, reader] = id3v1String(4);
    const result = reader(buffer, 0);

    expect(result).toBe("Abc");
  });

  test("length string", () => {
    const buffer = new Uint8Array([0x41, 0x62, 0x63, 0x7a]);
    const [, reader] = id3v1String(3);
    const result = reader(buffer, 0);

    expect(result).toBe("Abc");
  });

  test("null terminated string", () => {
    const buffer = new Uint8Array([0x41, 0x62, 0x63, 0x00, 0x7a]);
    const [, reader] = id3v1String(5);
    const result = reader(buffer, 0);

    expect(result).toBe("Abc");
  });
});
