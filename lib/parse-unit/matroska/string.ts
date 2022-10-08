import { map } from "../combinate/map";
import { utf8 } from "../primitive/string";

import type { Unit } from "../type/unit";

export const matroskaString = (length: number): Unit<string, RangeError> =>
  map(utf8(length), (value) => value.replace(/\0.*$/g, ""));
