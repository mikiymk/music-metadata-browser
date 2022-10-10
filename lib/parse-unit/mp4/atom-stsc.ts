import { sequenceMap } from "../combinate/sequence-map";

import { SampleToChunk, sampleToChunk } from "./entry-sample-to-chunk";
import { mp4AtomTableEntries } from "./table-entries";
import { mp4VersionFlags } from "./version-flags";

import type { Unit } from "../type/unit";

export interface Mp4AtomStsc {
  version: number;
  flags: number;
  entriesCount: number;
  entries: SampleToChunk[];
}

/**
 * Chunk offset atom, 'stco'
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25715
 * @param length
 * @returns
 */
export const mp4AtomStsc = (length: number): Unit<Mp4AtomStsc, RangeError> =>
  sequenceMap(mp4VersionFlags, mp4AtomTableEntries(length - 4, sampleToChunk), (versionFlags, entries) => {
    return {
      ...versionFlags,
      ...entries,
    };
  });
