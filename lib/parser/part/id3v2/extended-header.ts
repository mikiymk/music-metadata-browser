import { isBitSet } from "../../base/bit";
import { readBuffer } from "../../base/buffer";
import { readUint8, readUint16be, readUint32be } from "../../base/unsigned-integer";

import { readSyncSafeUint32be } from "./syncsafe-integer";

export const ID3V2_EXTENDED_HEADER_SIZE_SIZE = 4;

export const readId3v2ExtendedHeaderSize = (buffer: Uint8Array, offset: number): number => {
  return readUint32be(buffer, offset);
};

/**
 * ID3v2 tag header
 */
export interface Id3v23ExtendedHeader {
  // Extended header size
  size: number;
  extendedFlags: number;
  // Size of padding
  sizeOfPadding: number;
  // CRC data present
  crcDataPresent: boolean;
  crcData: number | undefined;
}

/**
 * ID3v2 extended header
 * @param buffer
 * @param offset
 * @returns
 */
export const readId3v23ExtendedHeader = (buffer: Uint8Array, offset: number): Id3v23ExtendedHeader => {
  const extendedFlags = readUint16be(buffer, offset + 4);
  const crcDataPresent = isBitSet(extendedFlags, 15);

  let crcData;
  if (crcDataPresent) {
    crcData = readUint32be(buffer, offset + 10);
  }

  return {
    size: readUint32be(buffer, offset),
    extendedFlags,
    sizeOfPadding: readUint32be(buffer, offset + 6),
    crcDataPresent,
    crcData,
  };
};

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
export const readId3v24ExtendedHeader = (buffer: Uint8Array, offset: number): Id3v24ExtendedHeader => {
  // Extended header size
  const size = readSyncSafeUint32be(buffer, offset);

  let readOffset = offset + 4;
  // Extended Flags
  const extendedFlagsData = readId3v24ExtendedHeaderData(buffer, readOffset);
  readOffset += extendedFlagsData.byteLength + 1;

  const extendedFlags = readUint8(extendedFlagsData, 0);

  const tagIsUpdate = isBitSet(extendedFlags, 6);
  const crcDataPresent = isBitSet(extendedFlags, 5);
  const tagRestrictions = isBitSet(extendedFlags, 4);

  // tag is update
  if (tagIsUpdate) {
    const result = readId3v24ExtendedHeaderData(buffer, readOffset);
    readOffset += result.byteLength + 1;
  }

  // CRC data
  let crcData;
  if (crcDataPresent) {
    crcData = readId3v24ExtendedHeaderData(buffer, readOffset);
    readOffset += crcData.byteLength + 1;
  }

  // Tag restrictions
  let restrictions;
  if (tagRestrictions) {
    const restrictionsData = readId3v24ExtendedHeaderData(buffer, readOffset);
    readOffset += restrictionsData.byteLength + 1;

    const restrictionsFlags = readUint8(restrictionsData, 0);

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

const readId3v24ExtendedHeaderData = (buffer: Uint8Array, offset: number): Uint8Array => {
  return readBuffer(buffer, offset + 1, readUint8(buffer, offset));
};
