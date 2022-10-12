import { join } from "node:path";

import { parseFile as origParseFile } from "music-metadata";
import { bench, describe } from "vitest";

import { parseFile as myParseFile } from "../lib";
import { samplePath } from "../test/util";

describe("dsf file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "dsf", "2L-110_stereo-5644k-1b_04_0.1-sec.dsf");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "dsf", "2L-110_stereo-5644k-1b_04_0.1-sec.dsf");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});
