import { map } from "../combinate/map";
import { u8 } from "../primitive/integer";

import type { Unit } from "../type/unit";

/**
 * Variable-Size Integer
 * @param maxLength
 * @returns
 */
export const vintLength = (maxLength: number): Unit<number, Error | RangeError> =>
  map(u8, (value) => {
    let mask = 0b1000_0000;
    let oc = 1;

    // Calculate VINT_WIDTH
    while (mask && !(value & mask)) {
      if (oc > maxLength) {
        return new Error("VINT value exceeding maximum size");
      }
      ++oc;
      mask >>= 1;
    }

    return oc;
  });
