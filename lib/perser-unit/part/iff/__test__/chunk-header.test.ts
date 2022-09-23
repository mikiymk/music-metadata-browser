import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { test, expect } from "vitest";

import { IffChunkHeader, iffChunkHeader } from "../chunk-header";

const [size, reader] = iffChunkHeader;

test("iff chunk header size = 8", () => {
  expect(size).toEqual(8);
});

test("read iff chunk header", () => {
  const buffer = new Uint8Array([[0x49, 0x46, 0x46, 0x20], [0, 0, 0, 30], Array.from({ length: 30 }, () => 0)].flat());
  const header: IffChunkHeader = reader(buffer, 0);

  expect(header).toEqual({
    id: "IFF ",
    size: 30,
  });
});

test("read iff file chunk header", async () => {
  const buffer = await readFile(join(__dirname, "chunk.iff"));
  const header: IffChunkHeader = reader(buffer, 0);

  expect(header).toEqual({
    id: "FORM",
    size: 2556,
  });
});
