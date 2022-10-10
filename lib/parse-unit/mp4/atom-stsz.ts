import { sequenceMap } from "../combinate/sequence-map";
import { u32be } from "../primitive/integer";

import { mp4AtomTableEntries } from "./table-entries";
import { mp4VersionFlags } from "./version-flags";

import type { Unit } from "../type/unit";

/**
 * Sample-size ('stsz') atom
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25710
 */
export interface Mp4AtomStsz {
  version: number;
  flags: number;
  sampleSize: number;
  entriesCount: number;
  entries: number[];
}

/**
 * Sample-size ('stsz') atom
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25710
 * @param length
 * @returns
 */
export const mp4AtomStsz = (length: number): Unit<Mp4AtomStsz, RangeError> =>
  sequenceMap(mp4VersionFlags, u32be, mp4AtomTableEntries(length - 8, u32be), (versionFlags, sampleSize, entries) => {
    return {
      ...versionFlags,
      sampleSize,
      ...entries,
    };
  });
