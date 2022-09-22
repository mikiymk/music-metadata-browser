import { latin1 } from "../../base/string";
import { map } from "../../token";

/*
 * Token for read FourCC
 * Ref: https://en.wikipedia.org/wiki/FourCC
 */

const validFourCC = /^[\u0021-\u007E©][\0\u0020-\u007E]{3}/;

export const fourCc = map(latin1(4), (id) => {
  if (!validFourCC.test(id)) throw new Error(`FourCC contains invalid characters: "${id}"`);
  return id;
});
