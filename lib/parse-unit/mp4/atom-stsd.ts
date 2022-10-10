import { sequenceMap } from "../combinate/sequence-map";
import { bytesTokenizer } from "../primitive/bytes";
import { u32be } from "../primitive/integer";
import { readUnitFromBufferTokenizer } from "../utility/read-unit";

import { sampleDescription, SampleDescription } from "./entry-sample-description";
import { mp4VersionFlags } from "./version-flags";

export interface Mp4AtomStsd {
  version: number;
  flags: number;
  entriesCount: number;
  entries: SampleDescription[];
}

/**
 * Atom: Sample-description Atom ('stsd')
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25691
 * @param length
 * @returns
 */
export const mp4AtomStsd = (length: number) =>
  sequenceMap(mp4VersionFlags, u32be, bytesTokenizer(length - 8), (versionFlags, entriesCount, data) => {
    const entries: SampleDescription[] = [];

    for (let i = 0; i < entriesCount; ++i) {
      const entryLen = readUnitFromBufferTokenizer(data, u32be);
      entries.push(readUnitFromBufferTokenizer(data, sampleDescription(entryLen)));
    }

    return {
      ...versionFlags,
      entriesCount,
      entries,
    };
  });
