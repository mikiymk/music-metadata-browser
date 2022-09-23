import { test, expect } from "vitest";

import { generateBuffer } from "../../../../../test/util";
import { id3v1Header, type Id3v1Header } from "../id3v1";

const [size, reader] = id3v1Header;

test("ID3v1 tag size is 128 bytes", () => {
  expect(size).toBe(128);
});

test("read ID3v1.0 tag", () => {
  const buffer = generateBuffer(
    "TAG",
    "ID3v1 track name aaaaaaaaaaaaa",
    "ID3v1 artist name aaaaaaaaaaaa",
    "ID3v1 album name aaaaaaaaaaaaa",
    "2000",
    "ID3v1 comment aaaaaaaaaaaaaaaa",
    0x29
  );

  const tag: Id3v1Header = reader(buffer, 0);

  expect(tag).toEqual({
    header: "TAG",
    title: "ID3v1 track name aaaaaaaaaaaaa",
    artist: "ID3v1 artist name aaaaaaaaaaaa",
    album: "ID3v1 album name aaaaaaaaaaaaa",
    year: "2000",
    comment: "ID3v1 comment aaaaaaaaaaaaaaaa",
    zeroByte: 97,
    track: 97,
    genre: 41,
  });
});

test("read ID3v1.1 tag", () => {
  const buffer = generateBuffer(
    "TAG",
    "ID3v1 track name aaaaaaaaaaaaa",
    "ID3v1 artist name aaaaaaaaaaaa",
    "ID3v1 album name aaaaaaaaaaaaa",
    "2000",
    "ID3v1 comment aaaaaaaaaaaaaa",
    0x00,
    0x01,
    0x29
  );
  const tag: Id3v1Header = reader(buffer, buffer.byteLength - 128);

  expect(tag).toEqual({
    header: "TAG",
    title: "ID3v1 track name aaaaaaaaaaaaa",
    artist: "ID3v1 artist name aaaaaaaaaaaa",
    album: "ID3v1 album name aaaaaaaaaaaaa",
    year: "2000",
    comment: "ID3v1 comment aaaaaaaaaaaaaa",
    zeroByte: 0,
    track: 1,
    genre: 41,
  });
});
