import { isSuccess, Result } from "../../../result/result";
import { isBitSet } from "../../base/bit";
import { readUint16be, readUint32be } from "../../base/unsigned-integer";

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
export const readId3v23ExtendedHeader = (
  buffer: Uint8Array,
  offset: number
): Result<Id3v23ExtendedHeader, RangeError> => {
  // Extended header size
  const size = readUint32be(buffer, offset);
  if (!isSuccess(size)) return size;

  // Extended Flags
  const extendedFlags = readUint16be(buffer, offset + 4);
  if (!isSuccess(extendedFlags)) return extendedFlags;

  // Size of padding
  const sizeOfPadding = readUint32be(buffer, offset + 6);
  if (!isSuccess(sizeOfPadding)) return sizeOfPadding;

  // CRC data present
  const crcDataPresent = isBitSet(extendedFlags, 15);
  if (!isSuccess(crcDataPresent)) return crcDataPresent;

  // CRC data
  let crcData;
  if (crcDataPresent) {
    crcData = readUint32be(buffer, offset + 10);
  }
  if (!isSuccess(crcData)) return crcData;

  return { size, extendedFlags, sizeOfPadding, crcDataPresent, crcData };
};
