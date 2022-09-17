import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { test, expect } from "vitest";

import { ID3V1_SIZE, readId3v1, type Id3v1 } from "../id3v1";

test("ID3v1 tag size is 128 bytes", () => {
  expect(ID3V1_SIZE).toBe(128);
});

test("read ID3v1.0 tag", async () => {
  const buffer = await readFile(join(__dirname, "id3v10.mp3"));
  const tag: Id3v1 = readId3v1(buffer, buffer.byteLength - 128) as Id3v1;

  expect(tag).toEqual({
    album: "ID3v1 album name",
    artist: "ID3v1 artist name",
    comment: "ID3v1 comment aaaaaaaaaaaaaaaa",
    genre: 41,
    header: "TAG",
    title: "ID3v1 track name",
    track: 97,
    year: "2000",
    zeroByte: 97,
  });
});

test("read ID3v1.1 tag", async () => {
  const buffer = await readFile(join(__dirname, "id3v11.mp3"));
  const tag: Id3v1 = readId3v1(buffer, buffer.byteLength - 128) as Id3v1;

  expect(tag).toEqual({
    album: "ID3v1 album name",
    artist: "ID3v1 artist name",
    comment: "ID3v1 comment aaaaaaaaaaaaaa",
    genre: 41,
    header: "TAG",
    title: "ID3v1 track name",
    track: 1,
    year: "2000",
    zeroByte: 0,
  });
});
