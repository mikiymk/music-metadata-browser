import { readLatin1String } from "../../base/string";
import { readUint32le } from "../../base/unsigned-integer";

import { readApev2TagFlags, Apev2TagFlags } from "./tag-flags";

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

export const APEV2_FOOTER_SIZE = 32;

export const readApev2Footer = (buffer: Uint8Array, offset: number): Apev2Footer => {
  return {
    id: readLatin1String(buffer, offset, 8),
    version: readUint32le(buffer, offset + 8),
    size: readUint32le(buffer, offset + 12),
    fields: readUint32le(buffer, offset + 16),
    flags: readApev2TagFlags(buffer, offset + 20),
  };
};
