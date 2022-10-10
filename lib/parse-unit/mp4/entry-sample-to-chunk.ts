import { sequenceToObject } from "../combinate/sequence-to-object";
import { u32be } from "../primitive/integer";

/**
 * Sample-to-Chunk ('stsc') atom table entry interface
 */
export interface SampleToChunk {
  firstChunk: number;
  samplesPerChunk: number;
  sampleDescriptionId: number;
}

export const sampleToChunk = sequenceToObject(
  {
    firstChunk: 0,
    samplesPerChunk: 1,
    sampleDescriptionId: 2,
  },
  u32be,
  u32be,
  u32be
);
