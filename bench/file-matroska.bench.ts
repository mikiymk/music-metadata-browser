import { join } from "node:path";

import { parseFile as origParseFile } from "music-metadata";
import { bench, describe } from "vitest";

import { parseFile as myParseFile } from "../lib";
import { samplePath } from "../test/util";

describe("matroska file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "matroska", "alac-in-matroska-short.mka");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "matroska", "alac-in-matroska-short.mka");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});
