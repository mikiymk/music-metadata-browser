import { ignore } from "../../base/ignore";
import { latin1 } from "../../base/string";
import { u32le } from "../../base/unsigned-integer";
import { seqMap } from "../../token";

import { apev2TagFlags, Apev2TagFlags } from "./tag-flags";

/**
 * APE Tag Header/Footer Version 2.0
 * TAG: describes all the properties of the file [optional]
 */

export interface Apev2Footer {
  // should equal 'APETAGEX'
  id: string;
  // equals CURRENT_APE_TAG_VERSION
  version: number;
  // the complete size of the tag, including this footer (excludes header)
  size: number;
  // the number of fields in the tag
  fields: number;
  // Global tag flags of all items
  flags: Apev2TagFlags; // ToDo: what is this???
}

export const apev2Footer = seqMap(
  (id, version, size, fields, flags) => ({ id, version, size, fields, flags }),
  latin1(8),
  u32le,
  u32le,
  u32le,
  apev2TagFlags,
  ignore(8)
);
