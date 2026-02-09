import { describe, it } from "bun:test";
import { expect } from "bun:test";

import * as ByteArray from "../../src/common/byte-array";

function assertByteArray(subject: () => Uint8Array) {
  it("returns a Uint8Array", () => {
    expect(subject()).toBeInstanceOf(Uint8Array);
  });

  it("returns 16 bytes", () => {
    expect(subject()).toHaveLength(16);
  });
}

describe("ByteArray", () => {
  describe(".compare", () => {
    const subject = ByteArray.compare;
    const cases: Array<[string, number[], number[], number]> = [
      ["lhs < rhs", [1], [9], -1],
      ["lhs = rhs", [5], [5], 0],
      ["lhs > rhs", [9], [1], 1],
      ["non-leading lhs > rhs", [5, 9], [5, 3], 1],
      ["non-leading lhs = rhs", [5, 7], [5, 7], 0],
      ["non-leading lhs < rhs", [5, 3], [5, 9], -1],
    ];
    for (const [label, lhs, rhs, result] of cases) {
      it(`resolves ${label} to ${result}`, () => {
        expect(subject(Uint8Array.from(lhs), Uint8Array.from(rhs))).toBe(
          result,
        );
      });
    }
  });

  describe(".generateOneFilled", () => {
    const subject = ByteArray.generateOneFilled;

    assertByteArray(subject);

    it("has only one bits", () => {
      expect(subject().every((val) => val === 0xff)).toBe(true);
    });
  });

  describe(".generateRandomFilled", () => {
    const subject = ByteArray.generateRandomFilled;

    assertByteArray(subject);

    it("has mixed bits", () => {
      const bytes = subject();
      expect(bytes.some((val) => val !== 0xff)).toBe(true);
      expect(bytes.some((val) => val !== 0)).toBe(true);
    });

    it("almost always has different bits", () => {
      expect(subject()).not.toEqual(subject());
    });

    it("every call allocates distinct memory", () => {
      const byte_arrays = Array.from({ length: 1000 })
        .map(subject)
        .map((x) => x.toString());
      expect(new Set(byte_arrays).size).toBe(1000);
    });
  });

  describe(".generateZeroFilled", () => {
    const subject = ByteArray.generateZeroFilled;

    assertByteArray(subject);

    it("has only zero bits", () => {
      expect(subject().every((val) => val === 0)).toBe(true);
    });
  });
});
