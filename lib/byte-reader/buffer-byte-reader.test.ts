import { test, expect } from "vitest";
import { BufferByteReader } from "./buffer-byte-reader";

test("buffer byte reader read", async () => {
  const buf = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]);
  const reader = new BufferByteReader(buf);

  expect(await reader.read(2)).toBe(new Uint8Array([0x01, 0x02]));
  expect(await reader.read(3)).toBe(new Uint8Array([0x03, 0x04, 0x05]));
  expect(await reader.read(4)).toBe(new Uint8Array([0x06, 0x07, 0x08, 0x09]));

  await expect(reader.read(1)).rejects.toThrow("End-Of-Stream");
});

test("buffer byte reader peek", async () => {
  const buf = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]);
  const reader = new BufferByteReader(buf);

  expect(await reader.peek(2)).toBe(new Uint8Array([0x01, 0x02]));
  expect(await reader.peek(3)).toBe(new Uint8Array([0x01, 0x02, 0x03]));
  expect(await reader.peek(4)).toBe(new Uint8Array([0x01, 0x02, 0x03, 0x04]));

  await expect(reader.read(1)).not.rejects.toThrow("End-Of-Stream");
});

test("buffer byte reader peek and read", async () => {
  const buf = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09]);
  const reader = new BufferByteReader(buf);

  expect(await reader.peek(2)).toBe(new Uint8Array([0x01, 0x02]));
  expect(await reader.peek(3)).toBe(new Uint8Array([0x01, 0x02, 0x03]));
  expect(await reader.peek(4)).toBe(new Uint8Array([0x01, 0x02, 0x03, 0x04]));

  expect(await reader.read(2)).toBe(new Uint8Array([0x01, 0x02]));

  expect(await reader.peek(2)).toBe(new Uint8Array([0x03, 0x04]));
  expect(await reader.peek(3)).toBe(new Uint8Array([0x03, 0x04, 0x05]));
  expect(await reader.peek(4)).toBe(new Uint8Array([0x03, 0x04, 0x05, 0x06]));

  expect(await reader.read(3)).toBe(new Uint8Array([0x03, 0x04, 0x05]));

  expect(await reader.peek(2)).toBe(new Uint8Array([0x06, 0x07]));
  expect(await reader.peek(3)).toBe(new Uint8Array([0x06, 0x07, 0x08]));
  expect(await reader.peek(4)).toBe(new Uint8Array([0x06, 0x07, 0x08, 0x09]));

  expect(await reader.read(4)).toBe(new Uint8Array([0x06, 0x07, 0x08, 0x09]));

  await expect(reader.read(1)).rejects.toThrow("End-Of-Stream");
});
