import { sequenceMap } from "../combinate/sequence-map";

import { TimeToSample, timeToSample } from "./entry-time-to-sample";
import { mp4AtomTableEntries } from "./table-entries";
import { mp4VersionFlags } from "./version-flags";

import type { Unit } from "../type/unit";

/**
 * Time-to-sample('stts') atom.
 * Store duration information for a media’s samples.
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25696
 */
export interface Mp4AtomStts {
  version: number;
  flags: number;
  entriesCount: number;
  entries: TimeToSample[];
}

/**
 * Time-to-sample('stts') atom.
 * Store duration information for a media’s samples.
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25696
 * @param length
 * @returns
 */
export const mp4AtomStts = (length: number): Unit<Mp4AtomStts, RangeError> =>
  sequenceMap(mp4VersionFlags, mp4AtomTableEntries(length - 4, timeToSample), (versionFlags, entries) => {
    return {
      ...versionFlags,
      ...entries,
    };
  });
