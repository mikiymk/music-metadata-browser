import type { ByteReader } from "../../byte-reader/byte-reader";
import { parseUnsignedInt32LittleEndian } from "../base/unsigned-integer";
import { ApeTagItemFlags, parseApeTagItemFlags } from "./tag-item-flags";

export type ApeTagItemHeader = {
  // Length of assigned value in bytes
  size: number;
  // Private item tag flags
  flags: ApeTagItemFlags;
};

export const parseApeTagItemHeader = async (reader: ByteReader): Promise<ApeTagItemHeader> => {
  const size = await parseUnsignedInt32LittleEndian(reader);
  const flags = await parseApeTagItemFlags(reader);

  return {
    // Length of assigned value in bytes
    size,
    // reserved for later use (must be zero),
    flags,
  };
};
