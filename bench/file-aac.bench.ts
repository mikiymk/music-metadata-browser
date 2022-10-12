import { join } from "node:path";

import { parseFile as origParseFile } from "music-metadata";
import { bench, describe } from "vitest";

import { parseFile as myParseFile } from "../lib";
import { samplePath } from "../test/util";

const _: [string, string[]][] = [
  ["aac", ["aac", "adts-mpeg4.aac"]],
  ["aiff", ["aiff", "M1F1-int8-AFsp.aif"]],
  ["ape", ["monkeysaudio.ape"]],
  ["asf", ["asf", "asf.wma"]],
  ["dsf", ["dsf", "2L-110_stereo-5644k-1b_04_0.1-sec.dsf"]],
  ["flac", ["flac.flac"]],
  ["matroska", ["matroska", "alac-in-matroska-short.mka"]],
  ["mp3/layer1", ["mp3", "layer1", "fl1.mp1"]],
  ["mp3/layer2", ["mp3", "layer2", "fl10.mp2"]],
  ["mp3/layer3", ["mp3", "layer3", "compl.mp3"]],
  ["mp4", ["mp4", "id4.m4a"]],
  ["musepack/sv7", ["mpc", "apev2.sv7.mpc"]],
  ["musepack/sv8", ["mpc", "bach-goldberg-variatians-05.sv8.mpc"]],
  ["ogg/vorbis", ["Nirvana - In Bloom - 2-sec.ogg"]],
  ["ogg/opus", ["Nirvana - In Bloom - 2-sec.opus"]],
  ["ogg/speex", ["female_scrub.spx"]],
  ["wav", ["MusicBrainz - Beth Hart - Sinner's Prayer [id3v2.3].wav"]],
  ["wavpack", ["wavpack", "MusicBrainz - Beth Hart - Sinner's Prayer.wv"]],
];

describe("aac file", () => {
  bench("original music-metadata", async () => {
    const filePath = join(samplePath, "aac", "adts-mpeg4.aac");
    await origParseFile(filePath, {
      duration: true,
    });
  });

  bench("my music-metadata", async () => {
    const filePath = join(samplePath, "aac", "adts-mpeg4.aac");
    await myParseFile(filePath, {
      duration: true,
    });
  });
});
