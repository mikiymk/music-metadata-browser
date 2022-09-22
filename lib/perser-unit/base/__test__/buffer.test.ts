import { test, expect } from "vitest";

import { bytes } from "../buffer";

test("bits size = length", () => {
  expect(bytes(0)[0]).toBe(0);
  expect(bytes(5)[0]).toBe(5);
  expect(bytes(100)[0]).toBe(100);
});

test("decode uint8array", () => {
  const buffer = new Uint8Array([0x00, 0x01, 0x7f, 0x80, 0xff, 0x81]);
  const parser = bytes(2)[1];

  expect(parser(buffer, 0)).toEqual(Uint8Array.of(0x00, 0x01));
  expect(parser(buffer, 2)).toEqual(Uint8Array.of(0x7f, 0x80));
  expect(parser(buffer, 4)).toEqual(Uint8Array.of(0xff, 0x81));
  expect(parser(buffer, 3)).toEqual(Uint8Array.of(0x80, 0xff));
});
