/**
 *
 * @param buffer
 * @param length
 * @throws {RangeError}
 */
export const assertLength = (buffer: Uint8Array, length: number) => {
  if (buffer.byteLength < length)
    throw new RangeError(`${length} is outside the bounds of the Buffer { length: ${buffer.byteLength} }`);
};
