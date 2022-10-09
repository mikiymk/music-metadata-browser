import { sequenceToObject } from "../combinate/sequence-to-object";
import { bytes } from "../primitive/bytes";
import { u16be, u24be, u8 } from "../primitive/integer";

import type { Unit } from "../type/unit";

/**
 * Data Atom Structure ('data')
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW32
 */
export interface Mp4AtomData {
  /**
   * Type Indicator
   * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW28
   * The set of types from which the type is drawn
   * If 0, type is drawn from the well-known set of types.
   */
  type: number;
  wellKnownType: number;

  /**
   * Locale Indicator
   */
  country: number;
  language: number;

  /**
   * An array of bytes containing the value of the metadata.
   */
  value: Uint8Array;
}

export const mp4AtomData = (length: number): Unit<Mp4AtomData, RangeError> =>
  sequenceToObject(
    {
      type: 0,
      wellKnownType: 1,
      country: 2,
      language: 3,
      value: 4,
    },
    u8,
    u24be,
    u16be,
    u16be,
    bytes(length - 8)
  );
