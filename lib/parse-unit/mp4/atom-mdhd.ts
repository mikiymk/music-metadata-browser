import { sequenceToObject } from "../combinate/sequence-to-object";
import { u16be, u24be, u32be, u8 } from "../primitive/integer";
import { pad } from "../primitive/skip";

import { timeMacEpoch } from "./time-mac-epoch";

/**
 * Interface for the parsed Movie Header Atom (mdhd)
 */
export interface Mp4AtomMdhd {
  /**
   * A 1-byte specification of the version
   */
  version: number;

  /**
   * Three bytes of space for (future) flags.
   */
  flags: number;

  /**
   * A 32-bit integer that specifies (in seconds since midnight, January 1, 1904) when the media atom was created.
   * It is strongly recommended that this value should be specified using coordinated universal time (UTC).
   */
  creationTime: Date;

  /**
   * A 32-bit integer that specifies (in seconds since midnight, January 1, 1904) when the media atom was changed.
   * It is strongly recommended that this value should be specified using coordinated universal time (UTC).
   */
  modificationTime: Date;

  /**
   * A time value that indicates the time scale for this media—that is, the number of time units that pass per second in its time coordinate system.
   */
  timeScale: number;

  /**
   * Duration: the duration of this media in units of its time scale.
   */
  duration: number;

  /**
   * A 16-bit integer that specifies the language code for this media.
   * See Language Code Values for valid language codes.
   * Also see Extended Language Tag Atom for the preferred code to use here if an extended language tag is also included in the media atom.
   * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/QTFFChap4/qtff4.html#//apple_ref/doc/uid/TP40000939-CH206-34353
   */
  language: number;

  quality: number;
}

/**
 * Token: Media Header Atom
 * Ref:
 * - https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-SW34
 * - https://wiki.multimedia.cx/index.php/QuickTime_container#mdhd
 * @param length
 * @returns
 */
export const mp4AtomMdhd = (length: number) =>
  pad(
    sequenceToObject(
      {
        version: 0,
        flags: 1,
        creationTime: 2,
        modificationTime: 3,
        timeScale: 4,
        duration: 5,
        language: 6,
        quality: 7,
      },
      u8,
      u24be,
      timeMacEpoch,
      timeMacEpoch,
      u32be,
      u32be,
      u16be,
      u16be
    ),
    length
  );
