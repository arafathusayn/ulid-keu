import { describe, it, expect } from "bun:test";

import {
  UlidMonotonic,
  idCompare,
  idEqual,
  UlidMonotonicClass,
} from "../src/index";
import { EncodableId } from "../src/factory/id";

function assertDebuggable(
  id_name: string,
  generator: () => EncodableId,
) {
  describe("when cast as a string", () => {
    const subject = () => "" + generator();

    it(`mentions the type ${id_name}`, () => {
      expect(subject()).toContain(id_name);
    });
  });
}

function assertValidId128(
  id_name: string,
  factory: typeof UlidMonotonic,
  id_class: typeof UlidMonotonicClass,
) {
  describe(".generate", () => {
    const subject = () => factory.generate();

    it(`returns a ${id_name}`, () => {
      expect(subject()).toBeInstanceOf(id_class);
      expect(subject()).toBeInstanceOf(factory.type);
    });

    it("generates 128-bit id", () => {
      expect(subject().bytes).toHaveLength(16);
    });

    assertDebuggable(id_name, subject);
  });

  describe(".MIN", () => {
    const subject = () => factory.MIN();

    it(`returns a ${id_name}`, () => {
      expect(subject()).toBeInstanceOf(id_class);
    });

    it("generates 128-bit id", () => {
      expect(subject().bytes).toHaveLength(16);
    });

    assertDebuggable(id_name, subject);
  });

  describe(".MAX", () => {
    const subject = () => factory.MAX();

    it(`returns a ${id_name}`, () => {
      expect(subject()).toBeInstanceOf(id_class);
    });

    it("generates 128-bit id", () => {
      expect(subject().bytes).toHaveLength(16);
    });

    assertDebuggable(id_name, subject);
  });

  describe("canonical", () => {
    const id = factory.generate();

    it("encodes to a string", () => {
      expect(typeof factory.toCanonical(id)).toBe("string");
    });

    it(`decodes to a ${id_name}`, () => {
      expect(
        factory.fromCanonical(factory.toCanonical(id)),
      ).toBeInstanceOf(id_class);
    });

    it("converts symmetrically", () => {
      const cases: Array<[string, EncodableId]> = [
        ["generated", id],
        ["min", factory.MIN()],
        ["max", factory.MAX()],
      ];
      for (const [_label, test_id] of cases) {
        expect(factory.fromCanonical(factory.toCanonical(test_id))).toEqual(
          test_id,
        );
      }
    });

    describe("when decoded", () => {
      assertDebuggable(id_name, () =>
        factory.fromCanonical(id.toCanonical()),
      );
    });
  });

  describe("raw", () => {
    const id = factory.generate();

    it("encodes to a string", () => {
      expect(typeof factory.toRaw(id)).toBe("string");
    });

    it(`decodes to a ${id_name}`, () => {
      expect(factory.fromRaw(factory.toRaw(id))).toBeInstanceOf(id_class);
    });

    it("converts symmetrically", () => {
      const cases: Array<[string, EncodableId]> = [
        ["generated", id],
        ["min", factory.MIN()],
        ["max", factory.MAX()],
      ];
      for (const [_label, test_id] of cases) {
        expect(factory.fromRaw(factory.toRaw(test_id))).toEqual(test_id);
      }
    });

    describe("when decoded", () => {
      assertDebuggable(id_name, () => factory.fromRaw(id.toRaw()));
    });
  });
}

describe("UlidMonotonic Factory", () => {
  assertValidId128("UlidMonotonic", UlidMonotonic, UlidMonotonicClass);
});

const all_ids = [UlidMonotonic.generate()];

describe("idCompare", () => {
  it("compares the same id of any type", () => {
    for (const id of all_ids) {
      expect(idCompare(id, id)).toBe(0);
    }
  });

  it("works with ids of any type", () => {
    for (const lhs of all_ids) {
      for (const rhs of all_ids) {
        expect(() => idCompare(lhs, rhs)).not.toThrow();
      }
    }
  });
});

describe("idEqual", () => {
  it("equates the same id of any type", () => {
    for (const id of all_ids) {
      expect(idEqual(id, id)).toBe(true);
    }
  });

  it("works with ids of any type", () => {
    for (const lhs of all_ids) {
      for (const rhs of all_ids) {
        expect(() => idEqual(lhs, rhs)).not.toThrow();
      }
    }
  });
});
