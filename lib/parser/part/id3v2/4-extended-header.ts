import { isSuccess, Result } from "../../../result/result";
import { isBitSet } from "../../base/bit";
import { readBuffer } from "../../base/buffer";
import { readUint8 } from "../../base/unsigned-integer";

import { readSyncSafeUint32be } from "./syncsafe-integer";

/**
 * ID3v2 tag header
 */
export interface Id3v24ExtendedHeader {
  // Extended header size
  size: number;

  flags: {
    tagIsUpdate: boolean;
    crcDataPresent: boolean;
    tagRestrictions: boolean;
  };

  crcData: Uint8Array | undefined;
  restrictions:
    | {
        tagSize: number;
        textEncoding: number;
        textFieldSize: number;
        imageEncoding: number;
        imageSize: number;
      }
    | undefined;
}

/**
 * ID3v2 extended header
 * @param buffer
 * @param offset
 * @returns
 */
export const readId3v24ExtendedHeader = (
  buffer: Uint8Array,
  offset: number
): Result<Id3v24ExtendedHeader, RangeError> => {
  // Extended header size
  const size = readSyncSafeUint32be(buffer, offset);
  if (!isSuccess(size)) return size;

  let readOffset = offset + 4;
  // Extended Flags
  const extendedFlagsData = readId3v24ExtendedHeaderData(buffer, readOffset);
  if (!isSuccess(extendedFlagsData)) return extendedFlagsData;
  readOffset += extendedFlagsData.byteLength + 1;

  const extendedFlags = readUint8(extendedFlagsData, 0);
  if (!isSuccess(extendedFlags)) return extendedFlags;

  const tagIsUpdate = isBitSet(extendedFlags, 6);
  const crcDataPresent = isBitSet(extendedFlags, 5);
  const tagRestrictions = isBitSet(extendedFlags, 4);

  // tag is update
  if (tagIsUpdate) {
    const result = readId3v24ExtendedHeaderData(buffer, readOffset);
    if (!isSuccess(result)) return result;
    readOffset += result.byteLength + 1;
  }

  // CRC data
  let crcData;
  if (crcDataPresent) {
    crcData = readId3v24ExtendedHeaderData(buffer, readOffset);
    if (!isSuccess(crcData)) return crcData;
    readOffset += crcData.byteLength + 1;
  }

  // Tag restrictions
  let restrictions;
  if (tagRestrictions) {
    const restrictionsData = readId3v24ExtendedHeaderData(buffer, readOffset);
    if (!isSuccess(restrictionsData)) return restrictionsData;
    readOffset += restrictionsData.byteLength + 1;

    const restrictionsFlags = readUint8(restrictionsData, 0);
    if (!isSuccess(restrictionsFlags)) return restrictionsFlags;

    restrictions = {
      tagSize: restrictionsFlags >> 6,
      textEncoding: (restrictionsFlags & 0x20) >> 5,
      textFieldSize: (restrictionsFlags & 0x18) >> 3,
      imageEncoding: (restrictionsFlags & 0x04) >> 2,
      imageSize: restrictionsFlags & 0x03,
    };
  }

  return {
    size,
    flags: {
      tagIsUpdate,
      crcDataPresent,
      tagRestrictions,
    },
    crcData,
    restrictions,
  };
};

const readId3v24ExtendedHeaderData = (buffer: Uint8Array, offset: number): Result<Uint8Array, RangeError> => {
  const dataSize = readUint8(buffer, offset);
  if (!isSuccess(dataSize)) return dataSize;

  return readBuffer(buffer, offset + 1, dataSize);
};
