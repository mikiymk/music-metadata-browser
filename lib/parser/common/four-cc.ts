import { parseLatin1String } from "../base/string";
import { a2hex } from "../../common/Util";
import type { ITokenizer } from "../../strtok3/types";

const validFourCC = /^[\u0021-\u007E©][\0\u0020-\u007E]{3}/;

export const parseFourCC = async (tokenizer: ITokenizer): Promise<string> => {
  const id = await parseLatin1String(tokenizer, 4);
  if (!validFourCC.test(id)) {
    throw new Error(`FourCC contains invalid characters: ${a2hex(id)} "${id}"`);
  }

  return id;
};
