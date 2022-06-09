import { join } from "path";

import { assert } from "chai";

import { parseFile } from "../lib";
import { ratioToDb, dbToRatio, toRatio } from "../lib/common/Util";

import { samplePath } from "./util";

describe("Decode replaygain tags", () => {
  const filePath = join(samplePath, "04 Long Drive.flac");

  it("Convert ratio to dB", () => {
    assert.approximately(ratioToDb(0.99914551), -0.00371259, 0.000000005);
  });

  it("Convert dB to ratio", () => {
    assert.approximately(dbToRatio(-7.03), 0.1981527, 0.000000005);
  });

  it("Convert dB string value to IRatio", () => {
    assert.deepEqual(toRatio("-7.03 dB"), {
      dB: -7.03,
      ratio: 0.1981527025805098,
    });
    assert.deepEqual(toRatio("xxx"), { dB: NaN, ratio: NaN });
  });

  it("should decode replaygain tags from FLAC/Vorbis", async () => {
    return parseFile(filePath).then((metadata) => {
      assert.deepEqual(
        metadata.common.replaygain_track_gain,
        { dB: -7.03, ratio: 0.1981527025805098 },
        "replaygain_track_gain.ratio"
      );
      assert.deepEqual(
        metadata.common.replaygain_track_peak,
        { dB: -0.0037125893296365503, ratio: 0.99914551 },
        "replaygain_track_peak.ratio = -0.00371259 dB"
      );
    });
  });
});
