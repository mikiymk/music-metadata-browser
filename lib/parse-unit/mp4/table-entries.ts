import { sequenceMap } from "../combinate/sequence-map";
import { bytesTokenizer } from "../primitive/bytes";
import { u32be } from "../primitive/integer";
import { readUnitFromBufferTokenizer } from "../utility/read-unit";

import type { Unit } from "../type/unit";

export interface Mp4AtomTableEntries<T> {
  entriesCount: number;
  entries: T[];
}

export const mp4AtomTableEntries = <T>(
  length: number,
  unit: Unit<T, RangeError>
): Unit<Mp4AtomTableEntries<T>, RangeError> =>
  sequenceMap(u32be, bytesTokenizer(length - 4), (entriesCount, data) => {
    const entries: T[] = [];

    for (let i = 0; i < entriesCount; i++) {
      entries.push(readUnitFromBufferTokenizer(data, unit));
    }

    return { entriesCount, entries };
  });
