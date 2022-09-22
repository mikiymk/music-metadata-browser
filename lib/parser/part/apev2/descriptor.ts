import { readBuffer } from "../../base/buffer";
import { readUint32le } from "../../base/unsigned-integer";
import { readFourCcToken } from "../fourcc/fourcc";

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

export const APEV2_DESCRIPTOR_SIZE = 52;

export const readApev2Descriptor = (buffer: Uint8Array, offset: number): Apev2Descriptor => {
  return {
    id: readFourCcToken(buffer, offset),
    version: readUint32le(buffer, offset + 4) / 1000,
    descriptorBytes: readUint32le(buffer, offset + 8),
    headerBytes: readUint32le(buffer, offset + 12),
    seekTableBytes: readUint32le(buffer, offset + 16),
    headerDataBytes: readUint32le(buffer, offset + 20),
    apeFrameDataBytes: readUint32le(buffer, offset + 24),
    apeFrameDataBytesHigh: readUint32le(buffer, offset + 28),
    terminatingDataBytes: readUint32le(buffer, offset + 32),
    fileMD5: readBuffer(buffer, offset + 36, 16),
  };
};
