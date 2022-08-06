import { test, expect } from "vitest";
import { BufferByteReader } from "../../byte-reader/buffer-byte-reader";
import { parseIffChunk } from "./chunk.js";

test("parse iff chunk", async () => {
  const buf = new Uint8Array([
    0x41,
    0x42,
    0x43,
    0x44,
    0x00,
    0x00,
    0xa0,
    0xa0,
    ...Array.from({ length: 0xa0_a0 }, () => 0),
  ]);
  const reader = new BufferByteReader(buf);

  expect(await parseIffChunk(reader)).toEqual({
    chunkID: "ABCD",
    chunkSize: 0xa0_a0,
    chunkData: new BufferByteReader(new Uint8Array(0xa0_a0)),
  });
});
