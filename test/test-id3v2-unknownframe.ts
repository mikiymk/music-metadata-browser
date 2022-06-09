import { join } from "path";

import { assert } from "chai";

import { parseFile } from "../lib";

import { samplePath } from "./util";

const t = assert;

it('invalid "Date" frame should not cause crash', () => {
  const filename = "bug-id3v2-unknownframe.mp3";
  const filePath = join(samplePath, filename);

  function checkCommon(common) {
    t.strictEqual(common.title, "One", "common.title");
    t.strictEqual(common.artist, "Coheed And Cambria", "common.artist");
    t.strictEqual(common.album, "Year Of The Black Rainbow", "common.album");
    t.strictEqual(common.year, 2010, "common.year");
    t.deepEqual(common.track, { no: 1, of: null }, "common.track");
    t.deepEqual(common.genre, ["Progressive Rock"], "common.genre");
  }

  return parseFile(filePath, { duration: true }).then((metadata) => {
    checkCommon(metadata.common);
  });
});
