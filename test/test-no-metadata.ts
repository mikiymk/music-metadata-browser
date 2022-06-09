import { join } from "path";

import { assert } from "chai";

import { parseFile } from "../lib";

import { samplePath } from "./util";

it("should reject files that can't be parsed", async () => {
  const filePath = join(samplePath, "flac.flac.jpg");

  // Run with default options
  try {
    await parseFile(filePath);
    assert.fail("Should reject a file which cannot be parsed");
  } catch (err) {
    assert.isDefined(err);
    assert.isDefined(err.message);
  }
});
