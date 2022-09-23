import { trimRightNull } from "../../../common/Util";
import { latin1 } from "../../base/string";
import { map, TokenReader } from "../../token";

export const id3v1String = (length: number): TokenReader<string> =>
  map(latin1(length), (value) => trimRightNull(value).trim());
