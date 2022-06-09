import { join } from "path";

import { assert } from "chai";

import { parseFile } from "../lib";

import { samplePath } from "./util";

const t = assert;

it("should be able to read metadata with unknown encoding", async () => {
  const filename = "bug-unkown encoding.mp3";
  const filePath = join(samplePath, filename);

  const result = await parseFile(filePath);
  t.strictEqual(result.common.title, "808", "title");
  t.strictEqual(result.common.artist, "Benga", "artist");
  t.strictEqual(result.common.albumartist, "Benga", "albumartist");
  t.strictEqual(result.common.album, "Phaze One", "album");
  t.strictEqual(result.common.year, 2010, "year");
  t.strictEqual(result.common.track.no, 4, "track no");
  t.strictEqual(result.common.track.of, 8, "track of");
  t.strictEqual(result.common.genre?.[0], "Dubstep", "genre");
  t.strictEqual(
    result.common.picture?.[0]?.format,
    "image/jpeg",
    "picture format"
  );
  t.strictEqual(
    result.common.picture?.[0]?.data.length,
    6761,
    "picture length"
  );
});
