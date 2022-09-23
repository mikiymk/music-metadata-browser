import type { TokenReader } from "../token";

/**
 *
 * @param bitsNum
 * @param bitOffset
 * @returns
 */
export const isBitSet = (bitsNum: number, bitOffset: number): boolean => {
  return (bitsNum & (1 << bitOffset)) !== 0;
};

export const bits = <BitOffsets extends (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7)[]>(
  ...bitOffsets: BitOffsets
): TokenReader<{ [key in keyof BitOffsets]: boolean }> => [
  1,
  (buffer, offset) => {
    return bitOffsets.map((bitOffset) => isBitSet(buffer[offset], bitOffset)) as {
      [key in keyof BitOffsets]: boolean;
    };
  },
];
