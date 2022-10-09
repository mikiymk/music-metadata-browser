import { map } from "../combinate/map";
import { u8 } from "../primitive/integer";

/** Variable-Size Integer */
export const vintLength = map(u8, (value) => {
  let mask = 0b1000_0000;
  let oc = 1;

  // Calculate VINT_WIDTH
  while (mask && !(value & mask)) {
    ++oc;
    mask >>= 1;
  }

  return oc;
});
