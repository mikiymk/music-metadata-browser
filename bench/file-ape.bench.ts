import { join } from "node:path";

import { parseFile as origParseFile } from "music-metadata";
import { bench, describe } from "vitest";

import { parseFile as myParseFile } from "../lib";
import { samplePath } from "../test/util";

describe("ape file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "monkeysaudio.ape");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "monkeysaudio.ape");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});
