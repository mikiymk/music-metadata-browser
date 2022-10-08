import { map } from "../combinate/map";

import { matroskaUint } from "./uint";

import type { Unit } from "../type/unit";

export const matroskaFlag = (length: number): Unit<boolean, RangeError> =>
  map(matroskaUint(length), (value) => value === 1);
