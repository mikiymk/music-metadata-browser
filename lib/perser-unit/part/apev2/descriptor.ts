import { bytes } from "../../base/buffer";
import { u32le } from "../../base/unsigned-integer";
import { map, seqMap, TokenReader } from "../../token";
import { fourCc } from "../fourcc/fourcc";

/*
 * APE_DESCRIPTOR: defines the sizes (and offsets) of all the pieces, as well as the MD5 checksum
 */

export interface Apev2Descriptor {
  // should equal 'MAC '
  id: string;
  // versionIndex number * 1000 (3.81 = 3810) (remember that 4-byte alignment causes this to take 4-bytes)
  version: number;
  // the number of descriptor bytes (allows later expansion of this header)
  descriptorBytes: number;
  // the number of header APE_HEADER bytes
  headerBytes: number;
  // the number of header APE_HEADER bytes
  seekTableBytes: number;
  // the number of header data bytes (from original file)
  headerDataBytes: number;
  // the number of bytes of APE frame data
  apeFrameDataBytes: number;
  // the high order number of APE frame data bytes
  apeFrameDataBytesHigh: number;
  // the terminating data of the file (not including tag data)
  terminatingDataBytes: number;
  // the MD5 hash of the file (see notes for usage... it's a little tricky)
  fileMD5: Uint8Array;
}

export const apev2Descriptor: TokenReader<Apev2Descriptor> = seqMap(
  (
    id,
    version,
    descriptorBytes,
    headerBytes,
    seekTableBytes,
    headerDataBytes,
    apeFrameDataBytes,
    apeFrameDataBytesHigh,
    terminatingDataBytes,
    fileMD5
  ) => {
    return {
      id,
      version,
      descriptorBytes,
      headerBytes,
      seekTableBytes,
      headerDataBytes,
      apeFrameDataBytes,
      apeFrameDataBytesHigh,
      terminatingDataBytes,
      fileMD5,
    };
  },
  fourCc,
  map(u32le, (num) => num / 1000),
  u32le,
  u32le,
  u32le,
  u32le,
  u32le,
  u32le,
  u32le,
  bytes(16)
);
