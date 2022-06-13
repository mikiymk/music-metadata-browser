import * as Token from "../token-types";
import { IGetToken } from "../strtok3";

/**
 * Timestamp stored in seconds since Mac Epoch (1 January 1904)
 */
export const SecondsSinceMacEpoch: IGetToken<Date> = {
  len: 4,

  get: (buf: Buffer, off: number): Date => {
    const secondsSinceUnixEpoch = Token.UINT32_BE.get(buf, off) - 2082844800;
    return new Date(secondsSinceUnixEpoch * 1000);
  },
};
