import type { TokenReader } from "../token";

/**
 * constant value from no bytes parser
 * @param value
 * @returns uint8array
 */
export const cVal = <T>(value: T): TokenReader<T> => [0, () => value];
