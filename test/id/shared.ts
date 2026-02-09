import { describe, it, expect } from "bun:test";

import * as ByteArray from "../../src/common/byte-array";
import { BaseId } from "../../src/id/base";

type LabeledId = [string, BaseId];

interface IdConstructor {
  new (bytes: Uint8Array): BaseId;
}

interface GeneratableIdClass {
  generate(opts?: { time?: Date | number | null }): BaseId & { time: Date };
}

interface BasicIdClass {
  generate(): BaseId;
  name: string;
}

export function assertAccessorBytes(described_class: IdConstructor): void {
  describe("#bytes", () => {
    const subject = (bytes: Uint8Array) => new described_class(bytes).bytes;

    it("returns the bytes given to the constructor", () => {
      const testCases = [
        ByteArray.generateZeroFilled(),
        ByteArray.generateRandomFilled(),
        ByteArray.generateOneFilled(),
      ];
      for (const bytes of testCases) {
        expect(subject(bytes)).toEqual(bytes);
      }
    });
  });
}

export function assertAccessorTime(
  described_class: GeneratableIdClass,
  labeled_times: Array<[string, Date]>,
): void {
  describe("#time", () => {
    const subject = (time: Date) => described_class.generate({ time }).time;

    it("returns the time given to generate", () => {
      for (const [_label, time] of labeled_times) {
        expect(subject(time)).toEqual(time);
      }
    });
  });
}

export function assertCompareDemonstratesTotalOrder(
  labeled_ids: LabeledId[],
): void {
  describe("#compare", () => {
    for (let lhs_idx = 0; lhs_idx < labeled_ids.length; lhs_idx++) {
      const entry = labeled_ids[lhs_idx];
      if (!entry) continue;
      const [lhs_label, lhs_id] = entry;
      const subject = (other: BaseId) => lhs_id.compare(other.clone());
      const prev_ids = labeled_ids.filter((_, idx) => idx < lhs_idx);
      const next_ids = labeled_ids.filter((_, idx) => idx > lhs_idx);

      describe(`given ${lhs_label}`, () => {
        if (lhs_idx === labeled_ids.length - 1) {
          it("has no subsequent ids", () => {
            expect(next_ids).toHaveLength(0);
          });
        } else {
          it("returns -1 for all subsequent ids", () => {
            for (const [_label, id] of next_ids) {
              expect(subject(id)).toBe(-1);
            }
          });
        }

        it("returns 0 for itself", () => {
          expect(subject(lhs_id)).toBe(0);
        });

        if (lhs_idx === 0) {
          it("has no previous ids", () => {
            expect(prev_ids).toHaveLength(0);
          });
        } else {
          it("returns 1 for all previous ids", () => {
            for (const [_label, id] of prev_ids) {
              expect(subject(id)).toBe(1);
            }
          });
        }
      });
    }
  });
}

export function assertDebuggable(described_class: {
  new (): BaseId;
  name: string;
}): void {
  describe("when cast as a string", () => {
    const subject = () => "" + new described_class();

    it(`mentions the type ${described_class.name}`, () => {
      expect(subject()).toContain(described_class.name);
    });
  });
}

export function assertEqualDemonstratesSameness(
  labeled_ids: LabeledId[],
): void {
  describe("#equal", () => {
    for (const [lhs_label, lhs_id] of labeled_ids) {
      const subject = (other: BaseId) => lhs_id.equal(other.clone());

      describe(`given ${lhs_label}`, () => {
        it("returns true for itself", () => {
          expect(subject(lhs_id)).toBe(true);
        });

        it("returns false for all others", () => {
          for (const [_label, id] of labeled_ids) {
            if (id !== lhs_id) {
              expect(subject(id)).toBe(false);
            }
          }
        });
      });
    }
  });
}

export function assertGenerateBasics(described_class: BasicIdClass): void {
  describe(".generate", () => {
    const subject = () => described_class.generate();

    it(`returns a new ${described_class.name}`, () => {
      expect(subject()).toBeInstanceOf(described_class);
    });

    it("returns an id with different bytes each time", () => {
      expect(subject().bytes).not.toEqual(subject().bytes);
    });
  });
}
