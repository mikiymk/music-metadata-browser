import { sequenceToObject } from "../combinate/sequence-to-object";
import { u16be, u32be } from "../primitive/integer";

import type { Unit } from "../type/unit";

/**
 * Common Sound Sample Description (version & revision)
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-57317
 */
export interface Mp4SoundSampleDescriptionVersion {
  version: number;
  revision: number;
  vendor: number;
}

export const mp4SoundSampleDescriptionVersion: Unit<Mp4SoundSampleDescriptionVersion, RangeError> = sequenceToObject(
  { version: 0, revision: 1, vendor: 2 },
  u16be,
  u16be,
  u32be
);
