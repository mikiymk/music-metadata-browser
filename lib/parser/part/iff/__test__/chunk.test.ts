import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { test, expect } from "vitest";

import { IffChunk, readIffChunk } from "../chunk";

test("read iff chunk", () => {
  const buffer = new Uint8Array([[0x49, 0x46, 0x46, 0x20], [0, 0, 0, 30], Array.from({ length: 30 }, () => 0)].flat());
  const chunk: IffChunk = readIffChunk(buffer, 0) as IffChunk;

  expect(chunk).toEqual({
    header: {
      id: "IFF ",
      size: 30,
    },
    data: new Uint8Array(30),
  });
});

test("read iff file chunk", async () => {
  const buffer = await readFile(join(__dirname, "chunk.iff"));
  const chunk: IffChunk = readIffChunk(buffer, 0) as IffChunk;

  expect(chunk).toHaveProperty("header", {
    id: "FORM",
    size: 2556,
  });
  expect(chunk.data).toHaveLength(2556);
});
