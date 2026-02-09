import { describe, it, expect } from "bun:test";

import * as ByteArray from "../../src/common/byte-array";
import { InvalidBytes } from "../../src/common/exception";
import { BaseCoder } from "../../src/coder/base";

// Constants

export const BYTES = Object.freeze({
  ANY: ByteArray.generateRandomFilled(),
  MAX: ByteArray.generateOneFilled(),
  MIN: ByteArray.generateZeroFilled(),
});

export const ALPHABET = Object.freeze({
  ASCII: Array.from({ length: 128 }, (_v, k) => String.fromCharCode(k)).join(
    "",
  ),
  CROCKFORD32: "0123456789ABCDEFGHJKMNPQRSTVWXYZ",
  HEX: "0123456789ABCDEF",
});

// Helpers

export function describeNamespace(
  described_namespace: BaseCoder,
  encoding_any: string,
): string {
  return (
    described_namespace.constructor.name +
    ` (with random encoding ${encoding_any})`
  );
}

export function makeBytes(length: number): Uint8Array {
  return new Uint8Array(length);
}

export function makeString(length: number, alphabet: string): string {
  const generator = () => randomChar(alphabet);
  return Array.from({ length }, generator).join("");
}

function randomChar(alphabet: string): string {
  const random_idx = Math.floor(alphabet.length * Math.random());
  return alphabet.charAt(random_idx);
}

// Assertions

export function assertDecode({
  described_namespace,
  encoding_any,
  encoding_max,
  encoding_min,
}: {
  described_namespace: BaseCoder;
  encoding_any: string;
  encoding_max: string;
  encoding_min: string;
}) {
  describe(".decodeTrusted", () => {
    const subject = described_namespace.decodeTrusted.bind(described_namespace);

    it(`decodes ${encoding_min} to all 0-bits`, () => {
      expect(subject(encoding_min)).toEqual(BYTES.MIN);
    });

    it(`decodes ${encoding_max} to all 1-bits`, () => {
      expect(subject(encoding_max)).toEqual(BYTES.MAX);
    });

    it("inverts encode", () => {
      expect(subject(described_namespace.encode(BYTES.ANY))).toEqual(BYTES.ANY);
    });
  });
}

export function assertEncode({
  described_namespace,
  encoding_any,
  encoding_max,
  encoding_min,
}: {
  described_namespace: BaseCoder;
  encoding_any: string;
  encoding_max: string;
  encoding_min: string;
}) {
  describe(".encode", () => {
    const subject = described_namespace.encode.bind(described_namespace);

    it("requires a 16-byte Uint8Array", () => {
      expect(() => subject(undefined as unknown as Uint8Array)).toThrow(
        InvalidBytes,
      );
      expect(() => subject(makeBytes(15))).toThrow(InvalidBytes);
      expect(() => subject(makeBytes(17))).toThrow(InvalidBytes);
      expect(() => subject(BYTES.ANY)).not.toThrow();
    });
  });

  describe(".encodeTrusted", () => {
    const subject = described_namespace.encodeTrusted.bind(described_namespace);

    it(`encodes all 0-bits to ${encoding_min}`, () => {
      expect(subject(BYTES.MIN)).toBe(encoding_min);
    });

    it(`encodes all 1-bits to ${encoding_max}`, () => {
      expect(subject(BYTES.MAX)).toBe(encoding_max);
    });

    it("inverts decode", () => {
      expect(subject(described_namespace.decode(encoding_any))).toBe(
        encoding_any,
      );
    });
  });
}
