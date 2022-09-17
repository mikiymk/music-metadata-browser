/**
 *
 * @param bits
 * @param bitOffset
 * @returns
 */
export const isBitSet = (bits: number, bitOffset: number): boolean => {
  return (bits & (1 << bitOffset)) !== 0;
};
