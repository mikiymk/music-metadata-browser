import { test, expect, describe } from "vitest";

import { generateBuffer } from "../../../../../test/util";
import { id3v2Encoding, id3v2String } from "../encoding";

describe("encoding byte", () => {
  const [size, reader] = id3v2Encoding;

  test("size = 1", () => {
    expect(size).toBe(1);
  });

  test("read encoding byte", () => {
    const buffer = generateBuffer(0x01, 0x05);

    expect(reader(buffer, 0)).toBe(1);
    expect(reader(buffer, 1)).toBe(3);
  });
});

describe("encoded string", () => {
  test("read as latin1 string", () => {
    const [, reader] = id3v2String(0, 10);
    const buffer = generateBuffer("latin1 str");

    expect(reader(buffer, 0)).toBe("latin1 str");
  });

  test("read as utf-16be string", () => {
    const buffer = new Uint8Array([
      0x00, 0x75, 0x00, 0x74, 0x00, 0x66, 0x00, 0x2d, 0x00, 0x31, 0x00, 0x36, 0x00, 0x62, 0x00, 0x65, 0x00, 0x20, 0x00,
      0x73, 0x00, 0x74, 0x00, 0x72, 0x2b, 0x50,
    ]);
    const [, reader] = id3v2String(1, 26);

    expect(reader(buffer, 0)).toBe("utf-16be str⭐");
  });

  test("read as utf-16 bom with 0xfffe (little endian) string", () => {
    const buffer = new Uint8Array([
      0xff, 0xfe, 0x75, 0x00, 0x74, 0x00, 0x66, 0x00, 0x2d, 0x00, 0x31, 0x00, 0x36, 0x00, 0x20, 0x00, 0x62, 0x00, 0x6f,
      0x00, 0x6d, 0x00, 0x20, 0x00, 0x73, 0x00, 0x74, 0x00, 0x72, 0x00, 0x50, 0x2b,
    ]);
    const [, reader] = id3v2String(2, 32);

    expect(reader(buffer, 0)).toBe("utf-16 bom str⭐");
  });

  test("read as utf-16 bom with 0xfeff (big endian) string", () => {
    const buffer = new Uint8Array([
      0xfe, 0xff, 0x00, 0x75, 0x00, 0x74, 0x00, 0x66, 0x00, 0x2d, 0x00, 0x31, 0x00, 0x36, 0x00, 0x20, 0x00, 0x62, 0x00,
      0x6f, 0x00, 0x6d, 0x00, 0x20, 0x00, 0x73, 0x00, 0x74, 0x00, 0x72, 0x2b, 0x50,
    ]);
    const [, reader] = id3v2String(2, 32);

    expect(reader(buffer, 0)).toBe("utf-16 bom str⭐");
  });

  test("read as utf-8 string", () => {
    const buffer = new Uint8Array([0x75, 0x74, 0x66, 0x2d, 0x38, 0x20, 0x73, 0x74, 0x72, 0xe2, 0xad, 0x90]);
    const [, reader] = id3v2String(3, 12);

    expect(reader(buffer, 0)).toBe("utf-8 str⭐");
  });
});
