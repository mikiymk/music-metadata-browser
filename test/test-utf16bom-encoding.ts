import { join } from "path";

import { assert } from "chai";

import { parseFile } from "../lib";

import { samplePath } from "./util";

const t = assert;

it("should read utf16bom (big endian) encoded metadata correctly", () => {
  const filename = "bug-utf16bom-encoding.mp3";
  const filePath = join(samplePath, filename);

  return parseFile(filePath).then((result) => {
    t.equal(result.common.title, "It's All Over You Know", "title");
    t.equal(result.common.artist, "The Apers", "artist");
    t.deepEqual(result.common.artists, ["The Apers"], "artist");
    t.equal(result.common.albumartist, "The Apers", "albumartist");
    t.equal(result.common.album, "Reanimate My Heart", "album");
    t.equal(result.common.year, 2007, "year");
    t.deepEqual(result.common.track, { no: 1, of: null }, "track");
    t.deepEqual(result.common.genre, ["Punk Rock"], "genre");
  });
});
