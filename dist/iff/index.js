import * as Token from "../token-types";
import { FourCcToken } from "../common/FourCC";
/**
 * Common AIFF chunk header
 */
export const Header = {
    len: 8,
    get: (buf, off) => {
        return {
            // Chunk type ID
            chunkID: FourCcToken.get(buf, off),
            // Chunk size
            chunkSize: Number(BigInt(Token.UINT32_BE.get(buf, off + 4))),
        };
    },
};
//# sourceMappingURL=index.js.map