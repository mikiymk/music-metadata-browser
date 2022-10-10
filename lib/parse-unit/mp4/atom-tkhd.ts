import { sequenceToObject } from "../combinate/sequence-to-object";
import { bytes } from "../primitive/bytes";
import { u16be, u24be, u32be, u8 } from "../primitive/integer";
import { pad, skip } from "../primitive/skip";

import { timeMacEpoch } from "./time-mac-epoch";

import type { Unit } from "../type/unit";

/**
 * Track Header Atoms interface
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25550
 */
export interface Mp4AtomTkhd {
  version: number;
  flags: number;

  /**
   * Creation Time
   */
  creationTime: Date;

  /**
   * Modification Time
   */
  modificationTime: Date;

  /**
   * TrackID
   */
  trackId: number;

  /**
   * A time value that indicates the duration of this track (in the movie’s time coordinate system).
   * Note that this property is derived from the track’s edits. The value of this field is equal to the sum of the
   * durations of all of the track’s edits. If there is no edit list, then the duration is the sum of the sample
   * durations, converted into the movie timescale.
   */
  duration: number;

  /**
   * A 16-bit integer that indicates this track’s spatial priority in its movie.
   * The QuickTime Movie Toolbox uses this value to determine how tracks overlay one another.
   * Tracks with lower layer values are displayed in front of tracks with higher layer values.
   */
  layer: number;

  /**
   * A 16-bit integer that identifies a collection of movie tracks that contain alternate data for one another.
   * This same identifier appears in each 'tkhd' atom of the other tracks in the group.
   * QuickTime chooses one track from the group to be used when the movie is played.
   * The choice may be based on such considerations as playback quality, language, or the capabilities of the computer.
   * A value of zero indicates that the track is not in an alternate track group.
   */
  alternateGroup: number;

  /**
   * A 16-bit fixed-point value that indicates how loudly this track’s sound is to be played.
   * A value of 1.0 indicates normal volume.
   */
  volume: number;
}

export const mp4AtomTkhd = (length: number): Unit<Mp4AtomTkhd, RangeError> =>
  pad(
    sequenceToObject(
      {
        version: 0,
        flags: 1,
        creationTime: 2,
        modificationTime: 3,
        trackId: 4,
        // reserved 4 bytes
        duration: 6,
        layer: 8,
        alternateGroup: 9,
        volume: 10, // ToDo: fixed point
        // ToDo: add remaining fields
      },
      u8,
      u24be,
      timeMacEpoch,
      timeMacEpoch,
      u32be,
      skip(4),
      u32be,
      skip(8),
      u16be,
      u16be,
      u16be,
      skip(2),
      bytes(36),
      u32be,
      u32be
    ),
    length
  );
