import { sequenceMap } from "../combinate/sequence-map";
import { sequenceToObject } from "../combinate/sequence-to-object";
import { u16be } from "../primitive/integer";

import type { Unit } from "../type/unit";

/**
 * Sound Sample Description (Version 0)
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-130736
 */
export interface Mp4SoundSampleDescriptionVersion0 {
  numAudioChannels: number;
  /**
   * Number of bits in each uncompressed sound sample
   */
  sampleSize: number;
  /**
   * Compression ID
   */
  compressionId: number;

  packetSize: number;

  sampleRate: number;
}

export const mp4SoundSampleDescriptionVersion0: Unit<Mp4SoundSampleDescriptionVersion0, RangeError> = sequenceToObject(
  {
    numAudioChannels: 0,
    sampleSize: 1,
    compressionId: 2,
    packetSize: 3,
    sampleRate: 4,
  },
  u16be,
  u16be,
  u16be,
  u16be,
  sequenceMap(u16be, u16be, (integer, fractional) => integer + fractional / 10_000) // TODO
);
