import { map, TokenReader } from "../token";

import { u24be, u24le } from "./unsigned-integer";
import { dataview } from "./util";

export const i8: TokenReader<number> = [1, (buffer, offset) => dataview(buffer).getInt8(offset)];
export const i16le: TokenReader<number> = [2, (buffer, offset) => dataview(buffer).getInt16(offset, true)];
export const i16be: TokenReader<number> = [2, (buffer, offset) => dataview(buffer).getInt16(offset)];
export const i24le: TokenReader<number> = map(u24le, (unum) => (unum > 0x7f_ff_ff ? unum - 0x1_00_00_00 : unum));
export const i24be: TokenReader<number> = map(u24be, (unum) => (unum > 0x7f_ff_ff ? unum - 0x1_00_00_00 : unum));
export const i32le: TokenReader<number> = [4, (buffer, offset) => dataview(buffer).getInt32(offset, true)];
export const i32be: TokenReader<number> = [4, (buffer, offset) => dataview(buffer).getInt32(offset)];
export const i64le: TokenReader<bigint> = [8, (buffer, offset) => dataview(buffer).getBigInt64(offset, true)];
export const i64be: TokenReader<bigint> = [8, (buffer, offset) => dataview(buffer).getBigInt64(offset)];
