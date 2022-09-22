import { expect, test } from "vitest";

import { generateBuffer } from "../../../../../test/util";
import { APEV2_TAG_ITEM_HEADER_SIZE, readApev2TagItemHeader } from "../tag-item-header";

test("apev2 descriptor size = 52", () => {
  expect(APEV2_TAG_ITEM_HEADER_SIZE).toBe(8);
});

test("read apev2 descriptor", () => {
  const buffer = generateBuffer([0x01, 0x02, 0x03, 0x04], [0x02, 0x02, 0x03, 0x04]);
  const result = readApev2TagItemHeader(buffer, 0);
  expect(result).toEqual({
    size: 0x04_03_02_01,
    flags: {
      containsHeader: false,
      containsFooter: false,
      isHeader: false,
      readOnly: false,
      dataType: 1,
    },
  });
});
