import { f32be, f64be } from "../primitive/float";
import { pad } from "../primitive/skip";
import { val } from "../primitive/value";

import type { Unit } from "../type/unit";

export const matroskaFloat = (length: number): Unit<number, RangeError> => {
  return (
    {
      0: val(0),
      4: f32be,
      8: f64be,
      10: pad(f64be, length),
    }[length] ?? val(new Error(`Invalid IEEE-754 float length: ${length}`))
  );
};
