import { test, expect } from "vitest";
import { BufferByteReader } from "../../byte-reader/buffer-byte-reader";
import { parseIffChunk } from "../iff/chunk";
import { parseAiffCCommonChunk, parseAiffCommonChunk } from "./common";

test("parse aiff common chunk", async () => {
  const buf = new Uint8Array(
    [
      [0x01, 0x02, 0x03, 0x04],
      [0x00, 0x00, 0x00, 0x12],
      [0x01, 0x02],
      [0x01, 0x02, 0x03, 0x04],
      [0x01, 0x02],
      [0x40, 0x0f],
      [0x00, 0x81],
      [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    ].flat()
  );
  const tokenizer = new BufferByteReader(buf);
  const chunk = await parseIffChunk(tokenizer);

  expect(await parseAiffCommonChunk(chunk)).toEqual({
    numChannels: 0x01_02,
    numSampleFrames: 0x01_02_03_04,
    sampleSize: 0x01_02,
    sampleRate: 0x01_02,
    compressionName: "PCM",
  });
});

test("parse aiff-c common chunk", async () => {
  const buf = new Uint8Array(
    [
      [0x01, 0x02, 0x03, 0x04],
      [0x00, 0x00, 0x00, 0x22],
      [0x01, 0x02],
      [0x01, 0x02, 0x03, 0x04],
      [0x01, 0x02],
      [0x40, 0x0d],
      [0x02, 0x04],
      [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
      [0x41, 0x43, 0x45, 0x38],
      [0x0a],
      [0x41, 0x43, 0x45, 0x20, 0x38, 0x2d, 0x74, 0x6f, 0x2d, 0x33],
      [0x00],
    ].flat()
  );
  const tokenizer = new BufferByteReader(buf);
  const chunk = await parseIffChunk(tokenizer);

  expect(await parseAiffCCommonChunk(chunk)).toEqual({
    numChannels: 0x01_02,
    numSampleFrames: 0x01_02_03_04,
    sampleSize: 0x01_02,
    sampleRate: 0x01_02,
    compressionType: "ACE8",
    compressionName: "ACE 8-to-3",
  });
});
