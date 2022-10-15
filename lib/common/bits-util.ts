/**
 * Read bit-aligned number start from buffer
 * Total offset in bits = byteOffset * 8 + bitOffset
 * @param value unsigned 8, 16, 24, 32bits number source
 * @param offset Starting offset in bits: 0 = lsb
 * @param length Length of number in bits
 * @returns Decoded bit aligned number
 */
export const getBitsNumber = (value: number, offset: number, length: number): number => {
  const maskBase = ~0;
  const upperMask = ~(maskBase >>> (32 - offset)) || maskBase;
  const lowerMask = maskBase >>> (32 - offset - length);

  const masked = value & (upperMask & lowerMask);

  const result = masked >>> offset;

  return result;

  // const s = (n: number) =>
  //   Array.from({ length: 8 }, () => ((n /= 0x10), Math.trunc(n * 0x10) % 0x10))
  //     .reverse()
  //     .map((v) => v.toString(2).padStart(4, "0"))
  //     .join(" ");
  // const t = (n: number) => s(n < 0 ? 0x1_00_00_00_00 + n : n);

  // return {
  //   value: t(value),
  //   offset,length,
  //   maskBase: t(maskBase),
  //   upperMask: t(upperMask),
  //   lowerMask: t(lowerMask),
  //   masked: t(masked),
  //   result: t(result),
  // };
};
