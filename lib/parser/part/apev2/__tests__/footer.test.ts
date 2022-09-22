import { expect, test } from "vitest";

import { generateBuffer } from "../../../../../test/util";
import { APEV2_FOOTER_SIZE, readApev2Footer } from "../footer";

test("apev2 descriptor size = 52", () => {
  expect(APEV2_FOOTER_SIZE).toBe(32);
});

test("read apev2 descriptor", () => {
  const buffer = generateBuffer(
    "APETAGEX",
    [0x01, 0x02, 0x03, 0x04],
    [0x02, 0x02, 0x03, 0x04],
    [0x03, 0x02, 0x03, 0x04],
    [0x04, 0x02, 0x03, 0x04]
  );
  const result = readApev2Footer(buffer, 0);
  expect(result).toEqual({
    id: "APETAGEX",
    version: 0x04_03_02_01,
    size: 0x04_03_02_02,
    fields: 0x04_03_02_03,
    flags: {
      containsHeader: false,
      containsFooter: false,
      isHeader: false,
      readOnly: false,
      dataType: 2,
    },
  });
});
