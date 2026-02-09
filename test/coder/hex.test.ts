import { describe, it, expect } from "bun:test";
import {
  ALPHABET,
  assertDecode,
  assertEncode,
  describeNamespace,
  makeString,
} from "./shared";

import { InvalidEncoding } from "../../src/common/exception";
import HexCoder from "../../src/coder/hex";

const described_namespace = HexCoder;

const encoding_any = makeString(32, ALPHABET.HEX);
const encoding_max = makeString(32, "F");
const encoding_min = makeString(32, "0");

describe(describeNamespace(described_namespace, encoding_any), () => {
  assertDecode({
    described_namespace,
    encoding_any,
    encoding_max,
    encoding_min,
  });

  describe(".decode", () => {
    const subject = described_namespace.decode.bind(described_namespace);

    it("requires a 32-character hex string", () => {
      expect(() => subject(undefined as unknown as string)).toThrow(
        InvalidEncoding,
      );
      expect(() => subject(encoding_any.slice(0, -1))).toThrow(
        InvalidEncoding,
      );
      expect(() =>
        subject(encoding_any + makeString(1, ALPHABET.HEX)),
      ).toThrow(InvalidEncoding);
      expect(() => subject(encoding_any)).not.toThrow();
    });
  });

  describe(".decodeTrusted extended", () => {
    const subject = described_namespace.decodeTrusted.bind(described_namespace);

    it("ignores case", () => {
      const encoding = makeString(
        32,
        ALPHABET.HEX + ALPHABET.HEX.toLowerCase(),
      );

      expect(subject(encoding)).toEqual(subject(encoding.toUpperCase()));
      expect(subject(encoding)).toEqual(subject(encoding.toLowerCase()));
    });
  });

  assertEncode({
    described_namespace,
    encoding_any,
    encoding_max,
    encoding_min,
  });
});
