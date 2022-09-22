import type { TokenReader } from "../token";

export const bits = <BitOffsets extends (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7)[]>(
  ...bitOffsets: BitOffsets
): TokenReader<{ [key in keyof BitOffsets]: boolean }> => [
  1,
  (buffer, offset) => {
    return bitOffsets.map((bitOffset) => !!(buffer[offset] & (1 << bitOffset))) as {
      [key in keyof BitOffsets]: boolean;
    };
  },
];
