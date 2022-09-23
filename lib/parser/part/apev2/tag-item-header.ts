import { readUint32le } from "../../base/unsigned-integer";

import { readApev2TagFlags, Apev2TagFlags } from "./tag-flags";

/**
 * APE Tag v2.0 Item Header
 */

export interface Apev2TagItemHeader {
  // Length of assigned value in bytes
  size: number;
  // Private item tag flags
  flags: Apev2TagFlags;
}

export const APEV2_TAG_ITEM_HEADER_SIZE = 8;

export const readApev2TagItemHeader = (buffer: Uint8Array, offset: number): Apev2TagItemHeader => {
  return {
    size: readUint32le(buffer, offset),
    flags: readApev2TagFlags(buffer, offset + 4),
  };
};
