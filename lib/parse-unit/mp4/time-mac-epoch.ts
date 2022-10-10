import { map } from "../combinate/map";
import { u32be } from "../primitive/integer";

const diffFromUnix = 2_082_844_800;

/**
 * Timestamp stored in seconds since Macintosh Epoch (1904-01-01)
 */
export const timeMacEpoch = map(u32be, (value) => {
  return new Date((value - diffFromUnix) * 1000);
});
