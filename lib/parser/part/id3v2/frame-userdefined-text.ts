import { readUint8 } from "../../base/unsigned-integer";

import { readId3v2String } from "./string";
import { readIdentifierAndData, splitValue } from "./utils";

interface UserDefinedText {
  description: string;
  text: string[];
}

export const readFrameUserDefinedText = (buffer: Uint8Array): UserDefinedText => {
  const encoding = readUint8(buffer, 0);
  const data = readIdentifierAndData(buffer, 1, buffer.length, encoding);
  const text = readId3v2String(encoding)(data.data);
  return {
    description: data.id,
    text: splitValue(text.replace(/\0+$/, "")),
  };
};
