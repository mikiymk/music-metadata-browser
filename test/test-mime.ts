import { readFileSync, createReadStream } from "fs";
import { join } from "path";

import { assert } from "chai";
import { getType } from "mime";

import { parseFile, parseStream } from "../lib";

import { SourceStream, samplePath } from "./util";

const t = assert;

describe("MIME & extension mapping", () => {
  const buf = Buffer.alloc(30).fill(0);

  const audioExtension = [".aac", ".mp3", ".ogg", ".wav", ".flac", ".m4a"]; // ToDo: ass ".ac3"

  function handleError(extension: string, err: Error) {
    switch (extension) {
      case ".aac":
      case ".m4a":
      case ".flac":
      case ".wav":
      case ".ogg":
        t.ok(
          err.message.startsWith("FourCC"),
          `Only FourCC error allowed, got: ${err.message}`
        );
        break;

      default:
        throw new Error(
          "caught error parsing " + extension + ": " + err.message
        );
    }
  }

  it("should reject an unknown file", () => {
    return parseFile(join(__dirname, "..", "package.json"))
      .then(() => t.fail("Should reject extension"))
      .catch((err) => {
        t.strictEqual(err.message, "Failed to determine audio format");
      });
  });

  it("should map MIME-types", () => {
    return Promise.all(
      audioExtension.map((extension) => {
        const streamReader = new SourceStream(buf);
        // Convert extension to MIME-Type
        const mimeType = getType(extension);
        t.isNotNull(mimeType, "extension: " + extension);

        return parseStream(streamReader, mimeType).catch((err) => {
          handleError(extension, err);
        });
      })
    );
  });

  it("should map on extension as well", () => {
    const prom = [];

    audioExtension.forEach((extension) => {
      const streamReader = new SourceStream(buf);
      const res = parseStream(streamReader, { path: extension }).catch(
        (err) => {
          handleError(extension, err);
        }
      );

      prom.push(res);
    });

    return Promise.all(prom);
  });

  it("should be able to handle MIME-type parameter(s)", async () => {
    // Wrap stream around buffer, to prevent the `stream.path` is provided
    const buffer = readFileSync(
      join(
        samplePath,
        "MusicBrainz - Beth Hart - Sinner's Prayer [id3v2.3].wav"
      )
    );
    const stream = new SourceStream(buffer);
    const metadata = await parseStream(stream);
    assert.equal(metadata.format.container, "WAVE");
  });

  describe("Resolve MIME based on content", () => {
    it("should fall back on content detection in case the extension is useless", async () => {
      const metadata = await parseFile(
        join(samplePath, "mp3", "1a643e9e0743dee8732554d0e870055a")
      );
      assert.equal(metadata.format.container, "MPEG");
      assert.equal(metadata.format.codec, "MPEG 1 Layer 3");
    });

    it("should throw error on unrecognized MIME-type", async () => {
      const streamReader = new SourceStream(buf);
      try {
        await parseStream(streamReader, { mimeType: "audio/not-existing" });
        assert.fail("Should throw an Error");
      } catch (err) {
        assert.equal(err.message, "Failed to determine audio format");
      }
    });

    it("should throw error on recognized MIME-type which is not supported", async () => {
      // Wrap stream around buffer, to prevent the `stream.path` is provided
      const buffer = readFileSync(join(samplePath, "flac.flac.jpg"));
      const stream = new SourceStream(buffer);

      try {
        await parseStream(stream, { mimeType: "audio/not-existing" });
        assert.fail("Should throw an Error");
      } catch (err) {
        assert.equal(
          err.message,
          "Guessed MIME-type not supported: image/jpeg"
        );
      }
    });

    async function testFileType(sample: string, container: string) {
      const stream = createReadStream(join(samplePath, sample));
      const metadata = await parseStream(stream);
      stream.close();
      assert.equal(metadata.format.container, container);
    }

    it("should recognize MP2", () => {
      return testFileType(
        "1971 - 003 - Sweet - Co-Co - CannaPower.mp2",
        "MPEG"
      );
    });

    it("should recognize MP3", () => {
      return testFileType("04-Strawberry.mp3", "MPEG");
    });

    it("should recognize WMA", () => {
      // file-type returns 'video/x-ms-wmv'
      return testFileType(join("asf", "asf.wma"), "ASF/audio");
    });

    it("should recognize MPEG-4 / m4a", () => {
      return testFileType(
        "MusicBrainz - Beth Hart - Sinner's Prayer.m4a",
        "M4A/mp42/isom"
      );
    });

    it("should recognize MPEG-4 / m4b", () => {
      return testFileType(join("mp4", "issue-127.m4b"), "M4A/3gp5/isom");
    });

    it("should recognize MPEG-4 / mp4", () => {
      return testFileType(
        join("mp4", "Mr. Pickles S02E07 My Dear Boy.mp4"),
        "mp42/isom"
      );
    });

    it("should recognize FLAC", () => {
      return testFileType("flac.flac", "FLAC");
    });

    it("should recognize OGG", () => {
      return testFileType("issue_62.ogg", "Ogg");
    });

    it("should recognize WAV", () => {
      return testFileType(
        "MusicBrainz - Beth Hart - Sinner's Prayer [id3v2.3].wav",
        "WAVE"
      );
    });

    it("should recognize APE", () => {
      return testFileType(
        "MusicBrainz - Beth Hart - Sinner's Prayer.ape",
        "Monkey's Audio"
      );
    });

    it("should recognize WMA", () => {
      return testFileType(join("asf", "issue_57.wma"), "ASF/audio");
    });

    it("should recognize WavPack", () => {
      return testFileType(
        join("wavpack", "MusicBrainz - Beth Hart - Sinner's Prayer.wv"),
        "WavPack"
      );
    });

    it("should recognize SV7", () => {
      return testFileType(join("mpc", "apev2.sv7.mpc"), "Musepack, SV7");
    });

    it("should recognize SV8", () => {
      return testFileType(
        join("mpc", "bach-goldberg-variatians-05.sv8.mpc"),
        "Musepack, SV8"
      );
    });

    it("should recognize DSF", () => {
      return testFileType(
        join("dsf", "2L-110_stereo-5644k-1b_04_0.1-sec.dsf"),
        "DSF"
      );
    });

    it("should recognize MKA", () => {
      return testFileType(
        join("matroska", "02 - Poxfil - Solid Ground (5 sec).mka"),
        "EBML/matroska"
      );
    });

    it("should recognize WebM", () => {
      return testFileType(
        join("matroska", "02 - Poxfil - Solid Ground (5 sec).opus.webm"),
        "EBML/webm"
      );
    });
  });
});
