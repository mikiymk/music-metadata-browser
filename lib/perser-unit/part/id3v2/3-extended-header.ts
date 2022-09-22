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
