import { join } from "node:path";

import { parseFile as origParseFile } from "music-metadata";
import { bench, describe } from "vitest";

import { parseFile as myParseFile } from "../lib";
import { samplePath } from "../test/util";

describe("musepack/sv7 file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "mpc", "apev2.sv7.mpc");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "mpc", "apev2.sv7.mpc");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});

describe("musepack/sv8 file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "mpc", "bach-goldberg-variatians-05.sv8.mpc");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "mpc", "bach-goldberg-variatians-05.sv8.mpc");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});
