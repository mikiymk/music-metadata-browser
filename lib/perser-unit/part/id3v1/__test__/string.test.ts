import { test, expect, describe } from "vitest";

import { readId3v1String } from "../string";

describe("read ID3v1 string", () => {
  test("empty string", () => {
    const buffer = new Uint8Array([0x00]);
    const result = readId3v1String(buffer, 0, buffer.byteLength);

    expect(result).toBe("");
  });

  test("null terminated string", () => {
    const buffer = new Uint8Array([0x41, 0x62, 0x63, 0x00]);
    const result = readId3v1String(buffer, 0, buffer.byteLength);

    expect(result).toBe("Abc");
  });

  test("length string", () => {
    const buffer = new Uint8Array([0x41, 0x62, 0x63, 0x7a]);
    const result = readId3v1String(buffer, 0, 3);

    expect(result).toBe("Abc");
  });

  test("null terminated string", () => {
    const buffer = new Uint8Array([0x41, 0x62, 0x63, 0x00, 0x7a]);
    const result = readId3v1String(buffer, 0, buffer.byteLength);

    expect(result).toBe("Abc");
  });
});
