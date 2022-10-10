import { sequenceToObject } from "../combinate/sequence-to-object";
import { u24be, u8 } from "../primitive/integer";
import { utf8 } from "../primitive/string";

import type { Unit } from "../type/unit";

/**
 * Name Atom
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW31
 */
export interface Mp4AtomName {
  /**
   * A 1-byte specification of the version
   */
  version: number;

  /**
   * Three bytes of space for (future) flags.
   */
  flags: number;

  /**
   * An array of bytes containing the value of the metadata.
   */
  name: string;
}

export const mp4AtomName = (length: number): Unit<Mp4AtomName, RangeError> =>
  sequenceToObject(
    {
      version: 0,
      flags: 1,
      name: 2,
    },
    u8,
    u24be,
    utf8(length - 4)
  );
