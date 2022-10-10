import { map } from "../combinate/map";
import { sequenceToObject } from "../combinate/sequence-to-object";
import { u32be } from "../primitive/integer";
import { latin1 } from "../primitive/string";

import type { Unit } from "../type/unit";

export interface Mp4AtomHeader {
  length: bigint;
  name: string;
}

export const mp4AtomHeader: Unit<Mp4AtomHeader, RangeError> = sequenceToObject(
  {
    length: 0,
    name: 1,
  },
  map(u32be, BigInt),
  latin1(4)
);
