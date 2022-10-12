import { join } from "node:path";

import { parseFile as origParseFile } from "music-metadata";
import { bench, describe } from "vitest";

import { parseFile as myParseFile } from "../lib";
import { samplePath } from "../test/util";

describe.skip("mp3/layer1 file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "mp3", "layer1", "fl1.mp1");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "mp3", "layer1", "fl1.mp1");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});

describe("mp3/layer2 file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "mp3", "layer2", "fl10.mp2");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "mp3", "layer2", "fl10.mp2");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});

describe("mp3/layer3 file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "mp3", "layer3", "compl.mp3");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "mp3", "layer3", "compl.mp3");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});
