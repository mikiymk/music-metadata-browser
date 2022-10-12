import { join } from "node:path";

import { parseFile as origParseFile } from "music-metadata";
import { bench, describe } from "vitest";

import { parseFile as myParseFile } from "../lib";
import { samplePath } from "../test/util";

describe("aiff file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "aiff", "M1F1-int8-AFsp.aif");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "aiff", "M1F1-int8-AFsp.aif");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});
