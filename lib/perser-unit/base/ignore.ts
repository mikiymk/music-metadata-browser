import type { TokenReader } from "../token";

export const ignore = (length: number): TokenReader<undefined> => [length, () => void 0];
