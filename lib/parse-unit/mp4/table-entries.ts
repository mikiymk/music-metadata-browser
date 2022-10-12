import initDebug from "../../debug";
import { sequenceMap } from "../combinate/sequence-map";
import { bytesTokenizer } from "../primitive/bytes";
import { u32be } from "../primitive/integer";
import { readUnitFromBufferTokenizer } from "../utility/read-unit";

import type { Unit } from "../type/unit";

const debug = initDebug("music-metadata:parser:MP4:atom");

export interface Mp4AtomTableEntries<T> {
  entriesCount: number;
  entries: T[];
}

export const mp4AtomTableEntries = <T>(
  length: number,
  unit: Unit<T, RangeError>
): Unit<Mp4AtomTableEntries<T>, RangeError> =>
  sequenceMap(u32be, bytesTokenizer(length - 4), (entriesCount, data) => {
    const remainingLen = data.fileInfo.size;
    debug(`remainingLen=${remainingLen}, numberOfEntries=${entriesCount} * token-len=${unit[0]}`);

    const entries: T[] = [];

    if (remainingLen === 0) return { entriesCount, entries };

    if (remainingLen !== entriesCount * unit[0])
      throw new Error("mismatch number-of-entries with remaining atom-length");

    for (let i = 0; i < entriesCount; i++) {
      entries.push(readUnitFromBufferTokenizer(data, unit));
    }

    return { entriesCount, entries };
  });
