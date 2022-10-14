import { decodeUtf8 } from "../compat/text-decoder";

/**
 *
 * @param str
 * @returns
 */
const stringToBytes = (str: string): number[] => {
  return [...str].map((character) => character.codePointAt(0));
};

/**
 * Checks whether the TAR checksum is valid.
 * @param buffer - The TAR header `[offset ... offset + 512]`.
 * @param offset - TAR header offset.
 * @returns `true` if the TAR checksum is valid, otherwise `false`.
 */
export const tarHeaderChecksumMatches = (buffer: Uint8Array, offset = 0): boolean => {
  const readSum = Number.parseInt(decodeUtf8(buffer.subarray(148, 154)).replace(/\0.*$/, "").trim(), 8); // Read sum in header
  if (Number.isNaN(readSum)) {
    return false;
  }

  let sum = 8 * 0x20; // Initialize signed bit sum

  for (let i = offset; i < offset + 148; i++) {
    sum += buffer[i];
  }

  for (let i = offset + 156; i < offset + 512; i++) {
    sum += buffer[i];
  }

  return readSum === sum;
};

/**
 *
 * @param buffer
 * @param headers
 * @param offset
 * @param mask
 * @returns
 */
export const check = (buffer: Uint8Array, headers: number[], offset = 0, mask?: number[]): boolean => {
  for (const [index, header] of headers.entries()) {
    // If a bitmask is set
    if (mask) {
      // If header doesn't equal `buf` with bits masked off
      if (header !== (mask[index] & buffer[index + offset])) {
        return false;
      }
    } else if (header !== buffer[index + offset]) {
      return false;
    }
  }

  return true;
};

export const checkString = (buffer: Uint8Array, header: string, offset?: number): boolean => {
  return check(buffer, stringToBytes(header), offset);
};
