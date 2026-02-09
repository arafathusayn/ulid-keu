import { describe, it, expect, beforeEach, afterAll } from "bun:test";
import {
  assertAccessorBytes,
  assertCompareDemonstratesTotalOrder,
  assertDebuggable,
  assertEqualDemonstratesSameness,
  assertGenerateBasics,
} from "./shared";

import * as ByteArray from "../../src/common/byte-array";
import {
  ClockSequenceOverflow,
  InvalidEpoch,
} from "../../src/common/exception";

import { UlidMonotonic as described_class } from "../../src/id/ulid-monotonic";

const MAX_TIME = new Date(Math.pow(2, 48) - 1);
const MIN_TIME = new Date(0);

describe(described_class.name, () => {
  beforeEach(() => described_class.reset());
  afterAll(() => described_class.reset());

  assertDebuggable(described_class);

  assertGenerateBasics(described_class);

  describe(".generate extended", () => {
    const subject = (time?: Date | number) =>
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

    it("throws when the clock sequence overflows", () => {
      const overflow = 0x10001;
      let sequence = 0;

      subject(Date.now() + 24 * 60 * 60 * 1000);
      expect(() => {
        for (; sequence <= overflow; ++sequence) {
          subject();
        }
      }).toThrow(ClockSequenceOverflow);
      expect(sequence).toBeGreaterThan(overflow >> 1);
      expect(sequence).toBeLessThan(overflow);
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

    it("ignores monotonicity", () => {
      subject();
      expect(subject().bytes).toEqual(ByteArray.generateZeroFilled());
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

    it("ignores monotonicity", () => {
      subject();
      expect(subject().bytes).toEqual(ByteArray.generateOneFilled());
    });
  });

  assertAccessorBytes(described_class);

  describe("#time", () => {
    const subject = (time?: Date | number) =>
      described_class.generate({ time }).time;

    describe("given a future time", () => {
      it("returns the time given to generate", () => {
        const cases: Array<[string, Date]> = [
          ["min", MIN_TIME],
          ["now", new Date()],
          ["max", MAX_TIME],
        ];
        for (const [_label, time] of cases) {
          expect(subject(time)).toEqual(time);
        }
      });
    });

    describe("given a past time", () => {
      it("returns the same time as the most recent id", () => {
        const most_recent_time = subject(MAX_TIME);
        const cases: Array<[string, Date]> = [
          ["min", MIN_TIME],
          ["now", new Date()],
          ["max", MAX_TIME],
        ];
        for (const [_label, time] of cases) {
          expect(subject(time)).toEqual(most_recent_time);
        }
      });
    });
  });

  assertCompareDemonstratesTotalOrder([
    ["the min id", described_class.MIN()],
    ["a min time id", described_class.generate({ time: MIN_TIME })],
    ["a recent id", described_class.generate({ time: new Date() })],
    ["a max time id", described_class.generate({ time: MAX_TIME })],
    ["an anachronistic id", described_class.generate({ time: new Date() })],
    ["the max id", described_class.MAX()],
  ]);

  assertEqualDemonstratesSameness([
    ["the min id", described_class.MIN()],
    ["a min time id", described_class.generate({ time: MIN_TIME })],
    ["a recent id", described_class.generate({ time: new Date() })],
    ["a max time id", described_class.generate({ time: MAX_TIME })],
    ["an anachronistic id", described_class.generate({ time: new Date() })],
    ["the max id", described_class.MAX()],
  ]);
});
