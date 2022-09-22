import { isBitSet } from "../../base/bit";
import { readUint32le } from "../../base/unsigned-integer";

import type { DataType } from "./data-type";

export interface Apev2TagFlags {
  containsHeader: boolean;
  containsFooter: boolean;
  isHeader: boolean;
  readOnly: boolean;
  dataType: DataType;
}

export const APEV2_TAG_FLAGS_SIZE = 4;

/**
 * read tag flags
 * @param buffer
 * @param offset
 * @returns
 */
export const readApev2TagFlags = (buffer: Uint8Array, offset: number): Apev2TagFlags => {
  const flags = readUint32le(buffer, offset);
  return {
    containsHeader: isBitSet(flags, 31),
    containsFooter: isBitSet(flags, 30),
    isHeader: isBitSet(flags, 31),
    readOnly: isBitSet(flags, 0),
    dataType: ((flags & 6) >> 1) as DataType,
  };
};
