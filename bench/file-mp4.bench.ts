import { join } from "node:path";

import { parseFile as origParseFile } from "music-metadata";
import { bench, describe } from "vitest";

import { parseFile as myParseFile } from "../lib";
import { samplePath } from "../test/util";

describe("mp4 file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "mp4", "id4.m4a");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "mp4", "id4.m4a");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});
