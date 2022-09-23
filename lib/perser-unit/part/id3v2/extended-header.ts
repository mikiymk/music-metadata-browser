import { cVal } from "../../base/const";
import { u32be } from "../../base/unsigned-integer";

import { syncsafeU32be } from "./syncsafe-integer";

export const id3v2ExtendedHeaderSize = (major: number) => {
  return major === 2 ? cVal(0) : major === 3 ? u32be : syncsafeU32be;
};
