import { sequenceMap } from "../combinate/sequence-map";
import { bytes } from "../primitive/bytes";
import { u32be } from "../primitive/integer";
import { readUnitFromBuffer } from "../utility/read-unit";

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
  sequenceMap(mp4VersionFlags, u32be, bytes(length - 8), (versionFlags, entriesCount, data) => {
    const entries: SampleDescription[] = [];

    let offset = 0;
    for (let i = 0; i < entriesCount; ++i) {
      // const entryLen = readUnitFromBufferTokenizer(data, u32be);
      // entries.push(readUnitFromBufferTokenizer(data, sampleDescription(entryLen)));

      const entryLen = readUnitFromBuffer(u32be, data, offset);
      offset += u32be[0];
      entries.push(readUnitFromBuffer(sampleDescription(entryLen), data, offset));
      offset += entryLen;
    }

    return {
      ...versionFlags,
      entriesCount,
      entries,
    };
  });
