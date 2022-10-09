import { bytes } from "../primitive/bytes";

import { matroskaFlag } from "./flag";
import { matroskaFloat } from "./float";
import { matroskaString } from "./string";
import { matroskaUint } from "./uint";

import type { Unit } from "../type/unit";

export type DataType =
  | "str" // string
  | "uint" // uint
  | "uid" // uid
  | "bool" // bool
  | "binary" // binary
  | "float"; // float

export const matroskaStringType = "str";
export const matroskaUintType = "uint";
export const matroskaUidType = "uid";
export const matroskaBooleanType = "bool";
export const matroskaBinaryType = "binary";
export const matroskaFloatType = "float";

export const matrsokaData = (
  datatype: DataType,
  length: number
): Unit<string | number | boolean | Uint8Array, RangeError> => {
  return {
    str: matroskaString,
    uint: matroskaUint,
    uid: matroskaFlag,
    bool: matroskaFlag,
    binary: bytes,
    float: matroskaFloat,
  }[datatype](length);
};
