import { sequenceToObject } from "../combinate/sequence-to-object";
import { u32be } from "../primitive/integer";

export interface TimeToSample {
  count: number;
  duration: number;
}

export const timeToSample = sequenceToObject({ count: 0, duration: 1 }, u32be, u32be);
