import { sequenceToObject } from "../combinate/sequence-to-object";
import { bytes } from "../primitive/bytes";
import { u16be, u24be, u32be, u8 } from "../primitive/integer";
import { pad, skip } from "../primitive/skip";

import { timeMacEpoch } from "./time-mac-epoch";

/**
 * Interface for the parsed Movie Header Atom (mvhd)
 */
export interface Mp4AtomMvhd {
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
   * Preferred rate: a 32-bit fixed-point number that specifies the rate at which to play this movie.
   * A value of 1.0 indicates normal rate.
   */
  preferredRate: number;

  /**
   * Preferred volume: A 16-bit fixed-point number that specifies how loud to play this movie’s sound.
   * A value of 1.0 indicates full volume.
   */
  preferredVolume: number;

  /**
   * Reserved: Ten bytes reserved for use by Apple. Set to 0.
   */
  // reserved: number,

  /**
   * Matrix structure: The matrix structure associated with this movie.
   * A matrix shows how to map points from one coordinate space into another.
   * See Matrices for a discussion of how display matrices are used in QuickTime.
   */
  // matrixStructure: ???;

  /**
   * Preview time: The time value in the movie at which the preview begins.
   */
  previewTime: number;

  /**
   * Preview duration: The duration of the movie preview in movie time scale units.
   */
  previewDuration: number;

  /**
   * Poster time: The time value of the time of the movie poster.
   */
  posterTime: number;

  /**
   * selection time: The time value for the start time of the current selection.
   */
  selectionTime: number;

  /**
   * Selection duration:  The duration of the current selection in movie time scale units.
   */
  selectionDuration: number;

  /**
   * Current time:  The time value for current time position within the movie.
   */
  currentTime: number;

  /**
   * Next track ID:  A 32-bit integer that indicates a value to use for the track ID number of the next track added to this movie. Note that 0 is not a valid track ID value.
   */
  nextTrackID: number;
}

export const mp4AtomMvhd = (length: number) =>
  pad(
    sequenceToObject(
      {
        version: 0,
        flags: 1,
        creationTime: 2,
        modificationTime: 3,
        timeScale: 4,
        duration: 5,
        preferredRate: 6,
        preferredVolume: 7,
        // ignore reserver: 10 bytes
        // ignore matrix structure: 36 bytes
        previewTime: 10,
        previewDuration: 11,
        posterTime: 12,
        selectionTime: 13,
        selectionDuration: 14,
        currentTime: 15,
        nextTrackID: 16,
      },
      u8,
      u24be,
      timeMacEpoch,
      timeMacEpoch,
      u32be,
      u32be,
      u32be,
      u16be,
      skip(10),
      bytes(36),
      u32be,
      u32be,
      u32be,
      u32be,
      u32be,
      u32be,
      u32be
    ),
    length
  );
