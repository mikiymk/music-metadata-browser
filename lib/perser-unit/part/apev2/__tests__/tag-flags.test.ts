import { expect, test } from "vitest";

import { generateBuffer } from "../../../../../test/util";
import { apev2TagFlags, Apev2TagFlags } from "../tag-flags";

const [size, reader] = apev2TagFlags;

const cases: [number[], Apev2TagFlags][] = [
  [
    [0x00, 0x00, 0x00, 0x00],
    {
      containsHeader: false,
      containsFooter: false,
      isHeader: false,
      readOnly: false,
      dataType: 0,
    },
  ],
  [
    [0xff, 0xff, 0xff, 0xff],
    {
      containsHeader: true,
      containsFooter: true,
      isHeader: true,
      readOnly: true,
      dataType: 3,
    },
  ],
  [
    [0x00, 0x00, 0x00, 0x80],
    {
      containsHeader: true,
      containsFooter: false,
      isHeader: true,
      readOnly: false,
      dataType: 0,
    },
  ],
  [
    [0x02, 0x00, 0x00, 0x40],
    {
      containsHeader: false,
      containsFooter: true,
      isHeader: false,
      readOnly: false,
      dataType: 1,
    },
  ],
  [
    [0x05, 0x00, 0x00, 0x00],
    {
      containsHeader: false,
      containsFooter: false,
      isHeader: false,
      readOnly: true,
      dataType: 2,
    },
  ],
];

test("apev2 tag flags size = 4", () => {
  expect(size).toBe(4);
});

test.each(cases)("read flags from %s", (source, expected) => {
  const result = reader(generateBuffer(source), 0);
  expect(result).toEqual(expected);
});
