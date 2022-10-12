import { join } from "node:path";

import { parseFile as origParseFile } from "music-metadata";
import { bench, describe } from "vitest";

import { parseFile as myParseFile } from "../lib";
import { samplePath } from "../test/util";

describe("wav file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "MusicBrainz - Beth Hart - Sinner's Prayer [id3v2.3].wav");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "MusicBrainz - Beth Hart - Sinner's Prayer [id3v2.3].wav");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});
