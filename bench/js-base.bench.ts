/* eslint-disable @typescript-eslint/no-throw-literal */
import { bench, describe } from "vitest";

describe("number or bigint", () => {
  bench("number", () => {
    let a = 1;

    a = a + 10;
    a = a - 5;
    a = a * 6;
    a = a / 4;

    if (a !== 9) throw a;
  });

  bench("bigint", () => {
    let a = 1n;

    a = a + 10n;
    a = a - 5n;
    a = a * 6n;
    a = a / 4n;

    if (a !== 9n) throw a;
  });
});

describe("construct a DataView each time", () => {
  bench("one dataview", () => {
    const data = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const buffer = data.buffer;
    const dataview = new DataView(buffer);

    let result = 0;
    for (let i = 0; i < 8; i++) {
      result += dataview.getUint8(i);
    }

    if (result !== 28) throw result;
  });

  bench("each dataview", () => {
    const data = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const buffer = data.buffer;

    let result = 0;
    for (let i = 0; i < 8; i++) {
      const dataview = new DataView(buffer);
      result += dataview.getUint8(i);
    }

    if (result !== 28) throw result;
  });

  bench("each dataview with parameter", () => {
    const data = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);

    let result = 0;
    for (let i = 0; i < 8; i++) {
      const dataview = new DataView(data.buffer, data.byteOffset, data.byteLength);
      result += dataview.getUint8(i);
    }

    if (result !== 28) throw result;
  });
});

const throwsError = () => {
  if (Math.random() > 0.5) throw new Error("error");
  return 1;
};

const returnsError = () => {
  if (Math.random() > 0.5) return new Error("error");
  return 1;
};

describe("throw or return error", () => {
  bench("throw and catch", () => {
    let result: unknown = 2;
    try {
      result = throwsError();
    } catch (error) {
      result = error;
    }

    if (result !== 1 && !(result instanceof Error)) throw result;
  });

  bench("return", () => {
    const result = returnsError();

    if (result !== 1 && !(result instanceof Error)) throw result;
  });
});

describe("spread map or array from", () => {
  const str = Array.from({ length: 1000 }, (_, i) => i).join("");

  bench("spread map", () => {
    [...str].map((c) => c.codePointAt(0));
  });

  bench("array from", () => {
    // eslint-disable-next-line unicorn/prefer-spread
    Array.from(str, (c) => c.codePointAt(0));
  });
});
