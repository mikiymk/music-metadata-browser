import { sequenceToObject } from "../combinate/sequence-to-object";
import { FourCC, fourCc } from "../iff/four-cc";
import { bytes } from "../primitive/bytes";
import { u16be } from "../primitive/integer";
import { skip } from "../primitive/skip";

import type { Unit } from "../type/unit";

/**
 * Atom: Sample Description Atom ('stsd')
 */
export interface SampleDescription {
  dataFormat: FourCC;
  dataReferenceIndex: number;
  description: Uint8Array;
}

/**
 * Atom: Sample Description Atom ('stsd')
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25691
 * @param length
 * @returns
 */
export const sampleDescription = (length: number): Unit<SampleDescription, RangeError> =>
  sequenceToObject(
    {
      dataFormat: 0,
      dataReferenceIndex: 2,
      description: 3,
    },
    fourCc,
    skip(6),
    u16be,
    bytes(length - 12)
  );
