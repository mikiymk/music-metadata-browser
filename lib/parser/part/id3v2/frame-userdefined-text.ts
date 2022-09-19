import { isSuccess, Result } from "../../../result/result";
import { readUint8 } from "../../base/unsigned-integer";

import { readIdentifierAndData, splitValue } from "./frame-utils";
import { readId3v2String } from "./string";

interface UserDefinedText {
  description: string;
  text: string[];
}

export const readFrameUserDefinedText = (
  type: "TXX" | "TXXX",
  buffer: Uint8Array
): Result<UserDefinedText, RangeError> => {
  const encoding = readUint8(buffer, 0);
  if (!isSuccess(encoding)) return encoding;

  const data = readIdentifierAndData(buffer, 1, buffer.length, encoding);
  if (!isSuccess(data)) return data;
  const text = readId3v2String(encoding)(data.data);
  if (!isSuccess(text)) return text;
  return {
    description: data.id,
    text: splitValue(text.replace(/\0+$/, "")),
  };
};
