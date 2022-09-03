import { test, expect } from "vitest";
import { BufferByteReader } from "../../byte-reader/buffer-byte-reader";
import { parseUint8Array } from "./buffer";

test("decode uint8array", async () => {
  const buf = new Uint8Array([0x00, 0x01, 0x7f, 0x80, 0xff, 0x81]);
  const tokenizer = new BufferByteReader(buf);

  expect(await parseUint8Array(tokenizer, 2)).toEqual(Uint8Array.of(0x00, 0x01));
  expect(await parseUint8Array(tokenizer, 0)).toEqual(Uint8Array.of());
  expect(await parseUint8Array(tokenizer, 1)).toEqual(Uint8Array.of(0x7f));
  expect(await parseUint8Array(tokenizer, 3)).toEqual(Uint8Array.of(0x80, 0xff, 0x81));
});
