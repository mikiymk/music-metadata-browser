import { ParseError } from "../../../errors/parse-error";
import { isSuccess, Result } from "../../../result/result";
import { isBitSet } from "../../base/bit";
import { readLatin1String } from "../../base/string";
import { readUint8 } from "../../base/unsigned-integer";

import { readSyncSafeUint32be } from "./syncsafe-integer";

/**
 * ID3v2 tag header
 */
export interface Id3v2Header {
  // ID3v2/file identifier   "ID3"
  id: "ID3";

  // ID3v2 versionIndex
  versionMajor: ID3v2MajorVersion;
  versionRevision: number;

  // ID3v2 flags
  // Unsynchronisation
  unsynchronisation: boolean;
  // Extended header
  isExtendedHeader: boolean;
  // Experimental indicator
  expIndicator: boolean;
  footer: boolean;

  size: number;
}

export type ID3v2MajorVersion = 2 | 3 | 4;

export const ID3V2_HEADER_SIZE = 10;

/**
 * ID3v2 header
 * Ref: http://id3.org/id3v2.3.0#ID3v2_header
 * ToDo
 * @param buffer
 * @param offset
 * @returns
 */
export const readId3v2Header = (buffer: Uint8Array, offset: number): Result<Id3v2Header, RangeError | ParseError> => {
  // ID3v2/file identifier   "ID3"
  const id = readLatin1String(buffer, offset, 3);
  if (!isSuccess(id)) return id;
  if (id !== "ID3") return new ParseError("Buffer does not contain ID3v2");

  // ID3v2 versionIndex
  const versionMajor = readUint8(buffer, offset + 3);
  if (!isSuccess(versionMajor)) return versionMajor;
  const versionRevision = readUint8(buffer, offset + 4);
  if (!isSuccess(versionRevision)) return versionRevision;
  if (versionMajor !== 2 && versionMajor !== 3 && versionMajor !== 4) return new ParseError("incompatible ID3v2 version");

  // ID3v2 flags
  const flags = readUint8(buffer, offset + 5);
  if (!isSuccess(flags)) return flags;

  // Unsynchronisation
  const unsynchronisation = isBitSet(flags, 7);
  // Extended header
  const isExtendedHeader = isBitSet(flags, 6);
  // Experimental indicator
  const expIndicator = isBitSet(flags, 5);
  const footer = isBitSet(flags, 4);

  const size = readSyncSafeUint32be(buffer, offset + 6);
  if (!isSuccess(size)) return size;

  return {
    id,

    versionMajor,
    versionRevision,

    unsynchronisation,
    isExtendedHeader,
    expIndicator,
    footer,

    size,
  };
};
