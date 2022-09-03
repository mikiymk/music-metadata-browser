import type { ByteReader } from "../../byte-reader/byte-reader";
import { parseLatin1String } from "../base/string";
import { parseUnsignedInt32LittleEndian } from "../base/unsigned-integer";
import { ApeTagItemFlags, parseApeTagItemFlags } from "./tag-item-flags";

export type ApeFooter = {
  // should equal 'APETAGEX'
  id: string;
  // equals CURRENT_APE_TAG_VERSION
  version: number;
  // the complete size of the tag, including this footer (excludes header)
  size: number;
  // the number of fields in the tag
  fields: number;
  // Global tag flags of all items
  flags: ApeTagItemFlags; // ToDo: what is this???
};

export const APE_FOOTER_BYTE_LENGTH = 24;

export const parseApeFooter = async (reader: ByteReader): Promise<ApeFooter> => {
  // should equal 'APETAGEX'
  const id = await parseLatin1String(reader, 8);
  // equals CURRENT_APE_TAG_VERSION
  const version = await parseUnsignedInt32LittleEndian(reader);
  // the complete size of the tag, including this footer (excludes header)
  const size = await parseUnsignedInt32LittleEndian(reader);
  // the number of fields in the tag
  const fields = await parseUnsignedInt32LittleEndian(reader);
  // reserved for later use (must be zero),
  const flags = await parseApeTagItemFlags(reader);

  return { id, version, size, fields, flags };
};
