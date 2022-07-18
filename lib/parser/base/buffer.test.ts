import { test, expect } from "vitest";
import { BufferTokenizer } from "../../strtok3/BufferTokenizer";
import { parseBuffer } from "./buffer";

test("decode uint8array", async () => {
  const buf = new Uint8Array([0x00, 0x01, 0x7f, 0x80, 0xff, 0x81]);
  const tokenizer = new BufferTokenizer(buf);

  expect(await parseBuffer(tokenizer, 2)).toEqual(Uint8Array.of(0x00, 0x01));
  expect(await parseBuffer(tokenizer, 0)).toEqual(Uint8Array.of());
  expect(await parseBuffer(tokenizer, 1)).toEqual(Uint8Array.of(0x7f));
  expect(await parseBuffer(tokenizer, 3)).toEqual(Uint8Array.of(0x80, 0xff, 0x81));
});
