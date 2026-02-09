import { describe, it, expect } from "bun:test";
import { InvalidEpoch } from "../../src/common/exception";
import * as EpochConverter from "../../src/common/epoch-converter";

describe("EpochConverter", () => {
  const epoch_origin_ms = Date.parse("1955-11-05Z");
  const min_time = 0 + epoch_origin_ms;
  const max_time = Math.pow(2, 48) - 1 + epoch_origin_ms;
  const now = Date.now();

  describe(".fromEpoch", () => {
    const subject = (time: number) =>
      EpochConverter.fromEpoch(epoch_origin_ms, time);

    it("returns a Date", () => {
      expect(subject(0)).toBeInstanceOf(Date);
    });

    it("returns the time after adjusting for the origin", () => {
      const cases: Array<[string, number, number]> = [
        ["min", 0, min_time],
        ["origin", -epoch_origin_ms, 0],
        ["now", now, now + epoch_origin_ms],
        ["max", Math.pow(2, 48) - 1, max_time],
      ];
      for (const [label, epoch_ms, time] of cases) {
        expect(subject(epoch_ms).getTime()).toBe(time);
      }
    });
  });

  describe(".toEpoch", () => {
    const subject = (time?: Date | number | null) =>
      EpochConverter.toEpoch(epoch_origin_ms, time);

    it("accepts a Date", () => {
      const cases: Array<[string, Date, number]> = [
        ["start of epoch time", new Date(min_time), 0],
        ["origin of epoch time", new Date(0), -epoch_origin_ms],
        ["current time", new Date(now + epoch_origin_ms), now],
        ["end of epoch time", new Date(max_time), Math.pow(2, 48) - 1],
      ];
      for (const [_label, value, epoch] of cases) {
        expect(() => subject(value)).not.toThrow();
        expect(subject(value)).toBe(epoch);
      }
    });

    it("accepts milliseconds", () => {
      const cases: Array<[string, number, number]> = [
        ["start of epoch time", min_time, 0],
        ["origin of epoch time", 0, -epoch_origin_ms],
        ["current time", now + epoch_origin_ms, now],
        ["end of epoch time", max_time, Math.pow(2, 48) - 1],
      ];
      for (const [_label, value, epoch] of cases) {
        expect(() => subject(value)).not.toThrow();
        expect(subject(value)).toBe(epoch);
      }
    });

    it("defaults to now for null and undefined", () => {
      const cases: Array<[string, null | undefined]> = [
        ["null", null],
        ["undefined", undefined],
      ];
      for (const [_label, value] of cases) {
        const currentNow = Date.now() - epoch_origin_ms;
        const result = subject(value);
        expect(result).toBeGreaterThanOrEqual(currentNow);
        expect(result).toBeLessThanOrEqual(currentNow + 1);
      }
    });

    it("rejects other falsey values", () => {
      const cases: Array<[string, unknown]> = [
        ["false", false],
        ["empty string", ""],
      ];
      for (const [_label, value] of cases) {
        expect(() =>
          EpochConverter.toEpoch(epoch_origin_ms, value as number),
        ).toThrow(InvalidEpoch);
      }
    });

    it("rejects other Date-like values", () => {
      const cases: Array<[string, unknown]> = [
        ["date string", "2018-01-10"],
        ["duck type", { getTime: () => {} }],
      ];
      for (const [_label, value] of cases) {
        expect(() =>
          EpochConverter.toEpoch(epoch_origin_ms, value as number),
        ).toThrow(InvalidEpoch);
      }
    });

    it("rejects pre/post-epoch values", () => {
      const cases: Array<[string, Date | number]> = [
        ["date before epoch time", new Date(min_time - 1)],
        ["ms before epoch time", min_time - 1],
        ["date after epoch time", new Date(max_time + 1)],
        ["ms after epoch time", max_time + 1],
      ];
      for (const [_label, value] of cases) {
        expect(() => subject(value)).toThrow(InvalidEpoch);
      }
    });
  });
});
