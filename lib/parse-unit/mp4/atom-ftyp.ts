import { map } from "../combinate/map";
import { bytesTokenizer } from "../primitive/bytes";
import { latin1 } from "../primitive/string";
import { readUnitFromBufferTokenizer } from "../utility/read-unit";

import type { Unit } from "../type/unit";

/**
 * The File Type Compatibility Atom
 * [QuickTime](https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap1/qtff1.html#//apple_ref/doc/uid/TP40000939-CH203-CJBCBIFF)
 * @param length
 * @returns
 */
export const mp4atomFtyp = (length: number): Unit<string[], RangeError> =>
  map(bytesTokenizer(length), (value) => {
    const types: string[] = [];

    while (value.fileInfo.size - value.position) {
      types.push(readUnitFromBufferTokenizer(value, latin1(4)));
    }

    return types;
  });
