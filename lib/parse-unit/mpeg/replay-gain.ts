import { getBitsNumber } from "../../common/bits-util";
import { isNumberBitSet } from "../../common/Util";
import { map } from "../combinate/map";
import { u16be } from "../primitive/integer";

import type { Unit } from "../type/unit";

export interface ReplayGain {
  type: NameCode;
  origin: ReplayGainOriginator;
  adjustment: number;
}

/**
 * https://github.com/Borewit/music-metadata/wiki/Replay-Gain-Data-Format#name-code
 */
type NameCode =
  /**
   * not set
   */
  | 0
  /**
   * Radio Gain Adjustment
   */
  | 1
  /**
   * Audiophile Gain Adjustment
   */
  | 2;

/**
 * https://github.com/Borewit/music-metadata/wiki/Replay-Gain-Data-Format#originator-code
 */
type ReplayGainOriginator =
  /**
   * Replay Gain unspecified
   */
  | 0
  /**
   * Replay Gain pre-set by artist/producer/mastering engineer
   */
  | 1
  /**
   * Replay Gain set by user
   */
  | 2
  /**
   * Replay Gain determined automatically, as described on this site
   */
  | 3
  /**
   * Set by simple RMS average
   */
  | 4;

/**
 * Replay Gain Data Format
 *
 * https://github.com/Borewit/music-metadata/wiki/Replay-Gain-Data-Format
 */
export const replayGain: Unit<ReplayGain, RangeError> = map(u16be, (value) => {
  return {
    type: getBitsNumber(value, 13, 3) as NameCode,
    origin: getBitsNumber(value, 10, 3) as ReplayGainOriginator,
    adjustment: (isNumberBitSet(value, 9) ? -1 : 1) * getBitsNumber(value, 0, 9),
  };
});
