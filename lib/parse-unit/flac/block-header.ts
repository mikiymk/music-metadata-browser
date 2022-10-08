import { isNumberBitSet } from "../../common/Util";
import { sequenceMap } from "../combinate/sequence-map";
import { u24be, u8 } from "../primitive/integer";

import type { Unit } from "../type/unit";

/**
 * FLAC supports up to 128 kinds of metadata blocks; currently the following are defined:
 * ref: https://xiph.org/flac/format.html#metadata_block
 */
export type BlockType =
  | 0 // STREAMINFO
  | 1 // PADDING
  | 2 // APPLICATION
  | 3 // SEEKTABLE
  | 4 // VORBIS_COMMENT
  | 5 // CUESHEET
  | 6 // PICTURE
  | number // reserved
  | 127; // invalid

/**
 * METADATA_BLOCK_DATA
 * Ref: https://xiph.org/flac/format.html#metadata_block_streaminfo
 */
export interface FlacBlockHeader {
  // Last-metadata-block flag: '1' if this block is the last metadata block before the audio blocks, '0' otherwise.
  lastBlock: boolean;
  // BLOCK_TYPE
  type: BlockType;
  // Length (in bytes) of metadata to follow (does not include the size of the METADATA_BLOCK_HEADER)
  length: number;
}

export const flacBlockHeader: Unit<FlacBlockHeader, RangeError> = sequenceMap(u8, u24be, (flags, length) => {
  return {
    lastBlock: isNumberBitSet(flags, 7),
    type: flags & 0x7f,
    length,
  };
});
