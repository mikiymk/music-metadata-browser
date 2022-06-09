import { readFileSync } from "fs";
import { join } from "path";

import { assert } from "chai";

import { parseFile } from "../lib";

import { samplePath } from "./util";

const t = assert;

it("should handle concurrent parsing of pictures", () => {
  const files = [
    join(samplePath, "flac.flac"),
    join(__dirname, "samples", "flac-bug.flac"),
  ];

  return Promise.all<any>(
    files.map((file) => {
      return parseFile(file).then((result) => {
        const data = readFileSync(file + ".jpg");
        t.deepEqual(result.common.picture[0].data, data, "check picture");
      });
    })
  );
});
