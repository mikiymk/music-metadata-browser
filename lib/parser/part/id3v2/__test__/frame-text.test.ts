import { test, expect } from "vitest";

import { generateBuffer } from "../../../../../test/util";
import { readFrameText } from "../frame-text";

test("parse null separated array: TIT1", () => {
  const buffer = new Uint8Array([0x00, 0x41, 0x62, 0x63]);
  const result = readFrameText("TT1", buffer);

  expect(result).toEqual(["Abc"]);
});

test("parse null separated array: TIT2", () => {
  const buffer = new Uint8Array([0x00, 0x41, 0x62, 0x63, 0x00, 0x44, 0x65, 0x66]);
  const result = readFrameText("TT2", buffer);

  expect(result).toEqual(["Abc", "Def"]);
});

test("parse to object: IPLS", () => {
  const buffer = new Uint8Array([0x00, 0x41, 0x62, 0x63, 0x00, 0x44, 0x65, 0x66]);
  const result = readFrameText("IPLS", buffer);

  expect(result).toEqual({ Abc: ["Def"] });
});

test("parse to plain text: TRCK", () => {
  const buffer = new Uint8Array([0x00, 0x41, 0x62, 0x63, 0x00, 0x44, 0x65, 0x66]);
  const result = readFrameText("TRCK", buffer);

  expect(result).toEqual("Abc\0Def");
});

test("parse content types: TCON", () => {
  const buffer = generateBuffer(0x00, "(1)", 0x00, "Abc", 0x00, "((a");
  const result = readFrameText("TCON", buffer);

  expect(result).toEqual(["Classic Rock", "Abc", "(a"]);
});

test("parse: PCST", () => {
  const buffer = generateBuffer(0x00, "Abc");
  const result = readFrameText("PCST", buffer);

  expect(result).toEqual(0);
});

test("parse: PCST", () => {
  const buffer = generateBuffer(0x00, "");
  const result = readFrameText("PCST", buffer);

  expect(result).toEqual(1);
});
