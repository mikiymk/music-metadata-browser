import { test, expect, describe } from "vitest";

import { generateBuffer } from "../../../../../test/util";
import { splitValue, parseGenre, functionList, readIdentifierAndData, readNullTerminatedString } from "../utils";

describe("split value", () => {
  const cases: [string, string[]][] = [
    ["", [""]],
    ["abc", ["abc"]],
    ["abc   ", ["abc   "]],
    ["abc def", ["abc def"]],
    ["abc\0def", ["abc", "def"]],
    ["abc  \0def", ["abc  ", "def"]],
    ["abc\0def\0 ", ["abc", "def", " "]],
  ];

  test.each(cases)("%s -> %s", (source, expected) => {
    expect(splitValue(source)).toEqual(expected);
  });
});

describe("Post parse genre", () => {
  const cases: [string, string[]][] = [
    ["52", ["Electronic"]],
    ["Electronic", ["Electronic"]],
    ["(52)(RX)", ["Electronic", "Remix"]],
    ["(52)(CR)", ["Electronic", "Cover"]],
    ["(0)", ["Blues"]],
    ["(0)(1)(2)", ["Blues", "Classic Rock", "Country"]],
    ["(0)(160)(2)", ["Blues", "Electroclash", "Country"]],
    ["(0)(192)(2)", ["Blues", "Country"]],
    ["(0)(255)(2)", ["Blues", "Country"]],
    ["(4)Eurodisco", ["Disco", "Eurodisco"]],
    ["(4)Eurodisco(0)Mopey", ["Disco", "Eurodisco", "Blues", "Mopey"]],
    ["(RX)(CR)", ["Remix", "Cover"]],
    ["1stuff", ["1stuff"]],
    ["RX/CR", ["RX/CR"]],
    ["((52)(RX)", ["(52)", "Remix"]],
    ["((52)((RX)", ["(52)(RX)"]],
  ];

  test.each(cases)("%s -> %s", (source, expected) => {
    expect(parseGenre(source)).toEqual(expected);
  });
});

describe("split value", () => {
  const tests: [string[], Record<string, string[]>][] = [
    [["aaa", "foo"], { aaa: ["foo"] }],
    [["aaa", "foo", "aaa", "bar"], { aaa: ["foo", "bar"] }],
    [["aaa", "foo,bar"], { aaa: ["foo", "bar"] }],
    [["aaa", "foo", "bbb", "bar"], { aaa: ["foo"], bbb: ["bar"] }],
    [["aaa", "foo,bar", "aaa", "baz"], { aaa: ["foo", "bar", "baz"] }],
  ];

  test.each(tests)("%j -> %j", (source, expected) => {
    expect(functionList(source)).toEqual(expected);
  });
});

describe("read id and data", () => {
  test("0 - 7", () => {
    const buffer = generateBuffer("id", 0x00, [0x01, 0x02, 0x03, 0x04]);

    expect(readIdentifierAndData(buffer, 0, 7, 0)).toEqual({
      id: "id",
      data: new Uint8Array([0x01, 0x02, 0x03, 0x04]),
    });
  });

  test("100 - 107", () => {
    const buffer = generateBuffer(new Uint8Array(100), "id", 0x00, [0x01, 0x02, 0x03, 0x04]);

    expect(readIdentifierAndData(buffer, 100, 107, 0)).toEqual({
      id: "id",
      data: new Uint8Array([0x01, 0x02, 0x03, 0x04]),
    });
  });
});

describe("read null terminated string", () => {
  const latin1Tests: [Uint8Array, [string, number]][] = [
    [generateBuffer("string", 0x00), ["string", 7]],
    [generateBuffer("str\0ing", 0x00), ["str", 4]],
    [generateBuffer(0x00), ["", 1]],
  ];

  test.each(latin1Tests)("read encode:latin1 %s", (buffer, expected) => {
    expect(readNullTerminatedString(buffer, 0, buffer.length, "latin1")).toEqual(expected);
  });

  const utf16Tests: [Uint8Array, [string, number]][] = [
    [generateBuffer("s", 0x00, "t", 0x00, "r", 0x00, "i", 0x00, "n", 0x00, "g", 0x00, 0x00, 0x00), ["string", 14]],
    [generateBuffer("s", 0x00, "t", 0x00, "r", 0x00, "\0", 0x00, "i", 0x00, "n", 0x00, "g", 0x00, 0x00), ["str", 8]],
    [generateBuffer(0x00, 0x00), ["", 2]],
  ];

  test.each(utf16Tests)("read encode:utf16le %s", (buffer, expected) => {
    expect(readNullTerminatedString(buffer, 0, buffer.length, "utf16le")).toEqual(expected);
  });
});
