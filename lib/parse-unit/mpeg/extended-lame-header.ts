import { getBitsNumber } from "../../common/bits-util";
import { map } from "../combinate/map";
import { sequenceToObject } from "../combinate/sequence-to-object";
import { u16be, u32be, u8 } from "../primitive/integer";
import { skip } from "../primitive/skip";

import { replayGain, ReplayGain } from "./replay-gain";

import type { Unit } from "../type/unit";

/**
 * LAME Tag, extends the Xing header format
 * First added in LAME 3.12 for VBR
 * The modified header is also included in CBR files (effective LAME 3.94), with "Info" instead of "XING" near the beginning.
 */
export interface ExtendedLameHeader {
  revision: number;
  vbr_method: number;
  lowpass_filter: number;
  track_peak: number | undefined;
  track_gain: ReplayGain;
  album_gain: ReplayGain;
  music_length: number;
  music_crc: number;
  header_crc: number;
}

/**
 * Info Tag
 * http://gabriel.mp3-tech.org/mp3infotag.html
 * https://github.com/quodlibet/mutagen/blob/abd58ee58772224334a18817c3fb31103572f70e/mutagen/mp3/_util.py#L112
 */
export const extendedLameHeader: Unit<ExtendedLameHeader, RangeError> = map(
  sequenceToObject(
    {
      revision: 0,
      lowpass_filter: 1,
      track_peak: 2,
      track_gain: 3,
      album_gain: 4,
      music_length: 6,
      music_crc: 7,
      header_crc: 8,
    },
    u8,
    map(u8, (value) => value * 100),
    map(u32be, (value) => (value === 0 ? undefined : value / Math.pow(2, 23))),
    replayGain,
    replayGain,
    skip(9),
    u32be,
    u16be,
    u16be
  ),
  ({ revision, ...value }) => {
    return {
      revision: getBitsNumber(revision, 4, 4),
      vbr_method: getBitsNumber(revision, 0, 4),
      ...value,
    };
  }
);
