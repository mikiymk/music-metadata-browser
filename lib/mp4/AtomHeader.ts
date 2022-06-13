import * as Token from "../token-types";
import { IToken } from "../strtok3";

import { FourCcToken } from "../common/FourCC";

export interface IAtomHeader {
  length: bigint;
  name: string;
}

export const Header: IToken<IAtomHeader> = {
  len: 8,

  get: (buf: Buffer, off: number): IAtomHeader => {
    const length = Token.UINT32_BE.get(buf, off);
    if (length < 0) throw new Error("Invalid atom header length");

    return {
      length: BigInt(length),
      name: new Token.StringType(4, "binary").get(buf, off + 4),
    };
  },

  put: (buf: Buffer, off: number, hdr: IAtomHeader) => {
    Token.UINT32_BE.put(buf, off, Number(hdr.length));
    return FourCcToken.put(buf, off + 4, hdr.name);
  },
};
