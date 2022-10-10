import { sequenceMap } from "../combinate/sequence-map";
import { u32be } from "../primitive/integer";

import { mp4AtomTableEntries } from "./table-entries";
import { mp4VersionFlags } from "./version-flags";

import type { Unit } from "../type/unit";

export interface Mp4AtomStco {
  version: number;
  flags: number;
  entriesCount: number;
  entries: number[];
}

/**
 * Chunk offset atom, 'stco'
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25715
 * @param length
 * @returns
 */
export const mp4AtomStco = (length: number): Unit<Mp4AtomStco, RangeError> =>
  sequenceMap(mp4VersionFlags, mp4AtomTableEntries(length - 4, u32be), (versionFlags, entries) => {
    return {
      ...versionFlags,
      ...entries,
    };
  });
