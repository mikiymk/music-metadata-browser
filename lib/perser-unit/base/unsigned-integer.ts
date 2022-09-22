import { dataview } from "./util";

import type { TokenReader } from "../token";

export const u8: TokenReader<number> = [1, (buffer, offset) => dataview(buffer).getUint8(offset)];
export const u16le: TokenReader<number> = [2, (buffer, offset) => dataview(buffer).getUint16(offset, true)];
export const u16be: TokenReader<number> = [2, (buffer, offset) => dataview(buffer).getUint16(offset)];

export const u24le: TokenReader<number> = [
  3,
  (buffer, offset) => {
    const view = dataview(buffer);

    return view.getUint8(offset) + (view.getUint16(offset + 1, true) << 8);
  },
];

export const u24be: TokenReader<number> = [
  3,
  (buffer, offset) => {
    const view = dataview(buffer);

    return (view.getUint16(offset) << 8) + view.getUint8(offset + 2);
  },
];

export const u32le: TokenReader<number> = [4, (buffer, offset) => dataview(buffer).getUint32(offset, true)];
export const u32be: TokenReader<number> = [4, (buffer, offset) => dataview(buffer).getUint32(offset)];
export const u64le: TokenReader<bigint> = [8, (buffer, offset) => dataview(buffer).getBigUint64(offset, true)];
export const u64be: TokenReader<bigint> = [8, (buffer, offset) => dataview(buffer).getBigUint64(offset)];
