import { join } from "node:path";

import { parseFile as origParseFile } from "music-metadata";
import { bench, describe } from "vitest";

import { parseFile as myParseFile } from "../lib";
import { samplePath } from "../test/util";

describe("ogg/vorbis file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "Nirvana - In Bloom - 2-sec.ogg");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "Nirvana - In Bloom - 2-sec.ogg");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});

describe("ogg/opus file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "Nirvana - In Bloom - 2-sec.opus");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "Nirvana - In Bloom - 2-sec.opus");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});

describe("ogg/speex file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "female_scrub.spx");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "female_scrub.spx");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});
