import { u32le } from "../../base/unsigned-integer";
import { seqMap, TokenReader } from "../../token";

import { Apev2TagFlags, apev2TagFlags } from "./tag-flags";

/**
 * APE Tag v2.0 Item Header
 */

export interface Apev2TagItemHeader {
  // Length of assigned value in bytes
  size: number;
  // Private item tag flags
  flags: Apev2TagFlags;
}

export const apev2TagItemHeader: TokenReader<Apev2TagItemHeader> = seqMap(
  (size, flags) => ({ size, flags }),
  u32le,
  apev2TagFlags
);
