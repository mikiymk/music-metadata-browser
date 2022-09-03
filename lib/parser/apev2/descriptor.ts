import type { ByteReader } from "../../byte-reader/byte-reader";
import { parseUint8Array } from "../base/buffer";
import { parseUnsignedInt32LittleEndian } from "../base/unsigned-integer";
import { parseFourCC } from "../common/four-cc";

export type ApeDescriptor = {
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
  // the MD5 hash of the file (see notes for usage... it's a littly tricky)
  fileMD5: Uint8Array;
};

export const APE_DESCRIPTOR_BYTE_LENGTH = 52;

export const parseApeDescriptor = async (reader: ByteReader): Promise<ApeDescriptor> => {
  // should equal 'MAC '
  const id = await parseFourCC(reader);
  // versionIndex number * 1000 (3.81 = 3810) (remember that 4-byte alignment causes this to take 4-bytes)
  const version = (await parseUnsignedInt32LittleEndian(reader)) / 1000;
  // the number of descriptor bytes (allows later expansion of this header)
  const descriptorBytes = await parseUnsignedInt32LittleEndian(reader);
  // the number of header APE_HEADER bytes
  const headerBytes = await parseUnsignedInt32LittleEndian(reader);
  // the number of header APE_HEADER bytes
  const seekTableBytes = await parseUnsignedInt32LittleEndian(reader);
  // the number of header data bytes (from original file)
  const headerDataBytes = await parseUnsignedInt32LittleEndian(reader);
  // the number of bytes of APE frame data
  const apeFrameDataBytes = await parseUnsignedInt32LittleEndian(reader);
  // the high order number of APE frame data bytes
  const apeFrameDataBytesHigh = await parseUnsignedInt32LittleEndian(reader);
  // the terminating data of the file (not including tag data)
  const terminatingDataBytes = await parseUnsignedInt32LittleEndian(reader);
  // the MD5 hash of the file (see notes for usage... it's a little tricky)
  const fileMD5 = await parseUint8Array(reader, 16);

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
};
