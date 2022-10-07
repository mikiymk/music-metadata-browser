import { stripNulls } from "../../common/Util";
import { sequenceMap } from "../combinate/sequence-map";
import { bytesTokenizer } from "../primitive/bytes";
import { u16le } from "../primitive/integer";
import { utf16le } from "../primitive/string";
import { readUnitFromBufferTokenizer } from "../utility/read-unit";

import type { ITag } from "../../type";
import type { Unit } from "../type/unit";

/**
 * 3.10 Content Description Object (optional, one only)
 * Ref: http://drang.s4.xrea.com/program/tips/id3tag/wmp/03_asf_top_level_header_object.html#3_10
 */

export const contentDescriptionObject = (size: number): Unit<ITag[], RangeError> =>
  sequenceMap(
    u16le,
    u16le,
    u16le,
    u16le,
    u16le,
    bytesTokenizer(size - 10),
    (titleSize, authorSize, copyrightSize, descriptionSize, ratingSize, data) => {
      const tags: ITag[] = [];

      for (const [id, strSize] of [
        ["Title", titleSize],
        ["Author", authorSize],
        ["Copyright", copyrightSize],
        ["Description", descriptionSize],
        ["Rating", ratingSize],
      ] as const) {
        tags.push({
          id,
          value: stripNulls(readUnitFromBufferTokenizer(data, utf16le(strSize))),
        });
      }

      return tags;
    }
  );
