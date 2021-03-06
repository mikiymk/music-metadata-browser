import * as Token from "../token-types";
import type { IGetToken } from "../strtok3";
import { ITagFlags, parseTagFlags } from "./APEv2TokenTagFlags";

/**
 * APE Tag v2.0 Item Header
 */
export interface ITagItemHeader {
  // Length of assigned value in bytes
  size: number;
  // Private item tag flags
  flags: ITagFlags;
}

/**
 * APE Tag v2.0 Item Header
 */
export const TagItemHeader: IGetToken<ITagItemHeader> = {
  len: 8,

  get: (buf, off) => {
    return {
      // Length of assigned value in bytes
      size: Token.UINT32_LE.get(buf, off),
      // reserved for later use (must be zero),
      flags: parseTagFlags(Token.UINT32_LE.get(buf, off + 4)),
    };
  },
};
