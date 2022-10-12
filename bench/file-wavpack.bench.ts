import { join } from "node:path";

import { parseFile as origParseFile } from "music-metadata";
import { bench, describe } from "vitest";

import { parseFile as myParseFile } from "../lib";
import { samplePath } from "../test/util";

describe("wavpack file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "wavpack", "MusicBrainz - Beth Hart - Sinner's Prayer.wv");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "wavpack", "MusicBrainz - Beth Hart - Sinner's Prayer.wv");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});
