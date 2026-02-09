import { describe, it, expect } from "bun:test";
import {
  assertAccessorBytes,
  assertAccessorTime,
  assertCompareDemonstratesTotalOrder,
  assertDebuggable,
  assertEqualDemonstratesSameness,
  assertGenerateBasics,
} from "./shared";

import * as ByteArray from "../../src/common/byte-array";
import { InvalidEpoch } from "../../src/common/exception";

import { Ulid as described_class } from "../../src/id/ulid";

const MAX_TIME = new Date(Math.pow(2, 48) - 1);
const MIN_TIME = new Date(0);

describe(described_class.name, () => {
  assertDebuggable(described_class);

  assertGenerateBasics(described_class);

  describe(".generate extended", () => {
    const subject = (time: Date | number) =>
      described_class.generate({ time });

    it("accepts epoch values", () => {
      const cases: Array<[string, Date]> = [
        ["start of epoch", MIN_TIME],
        ["end of epoch", MAX_TIME],
      ];
      for (const [_label, value] of cases) {
        expect(() => subject(value)).not.toThrow();
      }
    });

    it("rejects pre/post-epoch values", () => {
      const cases: Array<[string, number]> = [
        ["prior to 1970", MIN_TIME.getTime() - 1],
        ["after late 10889", MAX_TIME.getTime() + 1],
      ];
      for (const [_label, value] of cases) {
        expect(() => subject(value)).toThrow(InvalidEpoch);
      }
    });
  });

  describe(".MIN", () => {
    const subject = () => described_class.MIN();

    it("has all 0-bits", () => {
      expect(subject().bytes).toEqual(ByteArray.generateZeroFilled());
    });

    it("has the least allowed time", () => {
      expect(subject().time).toEqual(MIN_TIME);
    });
  });

  describe(".MAX", () => {
    const subject = () => described_class.MAX();

    it("has all 1-bits", () => {
      expect(subject().bytes).toEqual(ByteArray.generateOneFilled());
    });

    it("has the greatest allowed time", () => {
      expect(subject().time).toEqual(MAX_TIME);
    });
  });

  assertAccessorBytes(described_class);
  assertAccessorTime(described_class, [
    ["min", MIN_TIME],
    ["now", new Date()],
    ["max", MAX_TIME],
  ]);

  assertCompareDemonstratesTotalOrder([
    ["the min id", described_class.MIN()],
    ["a min time id", described_class.generate({ time: MIN_TIME })],
    ["a recent id", described_class.generate({ time: new Date() })],
    ["a max time id", described_class.generate({ time: MAX_TIME })],
    ["the max id", described_class.MAX()],
  ]);

  assertEqualDemonstratesSameness([
    ["the min id", described_class.MIN()],
    ["a min time id", described_class.generate({ time: MIN_TIME })],
    ["a recent id", described_class.generate({ time: new Date() })],
    ["a max time id", described_class.generate({ time: MAX_TIME })],
    ["the max id", described_class.MAX()],
  ]);
});
