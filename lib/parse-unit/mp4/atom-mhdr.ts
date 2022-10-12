import { sequenceMap } from "../combinate/sequence-map";
import { u32be } from "../primitive/integer";

import { mp4VersionFlags } from "./version-flags";

import type { Unit } from "../type/unit";

/**
 * Interface for the metadata header atom: 'mhdr'
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW13
 */
export interface Mp4AtomMhdr {
  version: number;
  flags: number;

  /**
   * A 32-bit unsigned integer indicating the value to use for the item ID of the next item created or assigned an item ID.
   * If the value is all ones, it indicates that future additions will require a search for an unused item ID.
   */
  nextItemID: number;
}

export const mp4AtomMhdr: Unit<Mp4AtomMhdr, RangeError> = sequenceMap(
  mp4VersionFlags,
  u32be,
  (versionFlags, nextItemID) => {
    return {
      ...versionFlags,
      nextItemID,
    };
  }
);
