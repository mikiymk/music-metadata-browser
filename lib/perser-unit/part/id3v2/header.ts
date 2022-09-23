import { bits } from "../../base/bit";
import { latin1 } from "../../base/string";
import { u8 } from "../../base/unsigned-integer";
import { seqMap, TokenReader } from "../../token";

import { syncsafeU32be } from "./syncsafe-integer";

/**
 * ID3v2 tag header
 */
export interface Id3v2Header {
  // ID3v2/file identifier   "ID3"
  id: string;

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

/**
 * ID3v2 header
 * Ref: http://id3.org/id3v2.3.0#ID3v2_header
 * ToDo
 * @param buffer
 * @param offset
 * @returns
 */
export const id3v2Header: TokenReader<Id3v2Header> = seqMap(
  (id, versionMajor, versionRevision, [unsynchronisation, isExtendedHeader, expIndicator, footer], size) => ({
    id,
    versionMajor,
    versionRevision,
    unsynchronisation,
    isExtendedHeader,
    expIndicator,
    footer,
    size,
  }),
  latin1(3),
  u8 as TokenReader<ID3v2MajorVersion>,
  u8,
  bits(7, 6, 5, 4),
  syncsafeU32be
);
