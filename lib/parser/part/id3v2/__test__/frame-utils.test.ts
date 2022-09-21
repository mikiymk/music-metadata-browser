import { test, expect, describe } from "vitest";

import { splitValue, parseGenre, functionList } from "../frame-utils";

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
