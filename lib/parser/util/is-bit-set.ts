/**
 * @param num
 * @param bit 0 is least significant bit (LSB)
 * @returns true if bit is 1; otherwise false
 */
export const isBitSet = (num: number, bit: number): boolean => (num & (1 << bit)) !== 0;
