import { sequenceToObject } from "../combinate/sequence-to-object";
import { u24be, u8 } from "../primitive/integer";

import type { Unit } from "../type/unit";

/**
 * Atom version and flags
 */
export interface Mp4VersionFlags {
  /**
   * A 1-byte specification of the version
   */
  version: number;

  /**
   * Three bytes of space for (future) flags.
   */
  flags: number;
}

export const mp4VersionFlags: Unit<Mp4VersionFlags, RangeError> = sequenceToObject({ version: 0, flags: 1 }, u8, u24be);
