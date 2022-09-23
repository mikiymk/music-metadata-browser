import { bits, isBitSet } from "../../base/bit";
import { ignore } from "../../base/ignore";
import { u8 } from "../../base/unsigned-integer";
import { seqMap, TokenReader } from "../../token";

import type { DataType } from "./data-type";

export interface Apev2TagFlags {
  containsHeader: boolean;
  containsFooter: boolean;
  isHeader: boolean;
  readOnly: boolean;
  dataType: DataType;
}

/**
 * read tag flags
 * @param buffer
 * @param offset
 * @returns
 */
export const apev2TagFlags: TokenReader<Apev2TagFlags> = seqMap(
  (flags, _1, [containsHeader, containsFooter]) => ({
    containsHeader,
    containsFooter,
    isHeader: containsHeader,
    readOnly: isBitSet(flags, 0),
    dataType: ((flags & 0b0110) >> 1) as DataType,
  }),
  u8,
  ignore(2),
  bits(7, 6)
);
