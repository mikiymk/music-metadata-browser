import type { ByteReader } from "../../byte-reader/byte-reader";
import { parseUnsignedInt32LittleEndian } from "../base/unsigned-integer";
import { isBitSet } from "../util/is-bit-set";

export type DataType = "utf8" | "binary" | "external" | "reserved";

export type ApeTagItemFlags = {
  containsHeader: boolean;
  containsFooter: boolean;
  isHeader: boolean;
  readOnly: boolean;
  dataType: DataType;
};

export const parseApeTagItemFlags = async (reader: ByteReader): Promise<ApeTagItemFlags> => {
  const flags = await parseUnsignedInt32LittleEndian(reader);

  const containsHeader = isBitSet(flags, 31);
  const containsFooter = isBitSet(flags, 30);
  const isHeader = isBitSet(flags, 29);
  let dataType: DataType;
  switch (flags & 0b0110) {
    case 0b0000:
      dataType = "utf8";
      break;
    case 0b0010:
      dataType = "binary";
      break;
    case 0b0100:
      dataType = "external";
      break;
    case 0b0110:
      dataType = "reserved";
      break;
  }
  const readOnly = isBitSet(flags, 0);

  return {
    containsHeader,
    containsFooter,
    isHeader,
    readOnly,
    dataType,
  };
};
