import { test, expect } from "vitest";

import { isSuccess, wrapResult } from "./result";

test("result wrap success", () => {
  const maybeUndefined: string | undefined = "abc";
  const result = wrapResult(() => maybeUndefined.toUpperCase());
  expect(result).toBe("ABC");
});

test("result wrap failure", () => {
  // eslint-disable-next-line strict-null-checks/all
  const maybeUndefined: string | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-assertion
  const result = wrapResult(() => maybeUndefined!.toUpperCase());
  expect(result).toBeInstanceOf(TypeError);
});

test("result wrap failure with primary", () => {
  const result = wrapResult(() => {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw 42;
  });
  expect(result).toEqual(new Error("wrap failure"));

  // fail on node.js v14
  // expect(result.cause).toBe(42);
});

test("result is success", () => {
  expect(isSuccess(5)).toBe(true);
  expect(isSuccess("abc")).toBe(true);
});

test("result is failure", () => {
  expect(isSuccess(new Error("this is error"))).toBe(false);
  expect(isSuccess(new RangeError("out of bounds"))).toBe(false);
});
