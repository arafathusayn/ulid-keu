import { describe, it, expect } from "bun:test";
import {
  ALPHABET,
  assertDecode,
  assertEncode,
  describeNamespace,
  makeBytes,
  makeString,
} from "./shared";

import { InvalidEncoding } from "../../src/common/exception";
import Crockford32Coder from "../../src/coder/crockford32";

const described_namespace = Crockford32Coder;

const encoding_any =
  makeString(1, "01234567") + makeString(25, ALPHABET.CROCKFORD32);
const encoding_max = "7" + makeString(25, "Z");
const encoding_min = makeString(26, "0");

describe(describeNamespace(described_namespace, encoding_any), () => {
  assertDecode({
    described_namespace,
    encoding_any,
    encoding_max,
    encoding_min,
  });

  describe(".decode", () => {
    const subject = described_namespace.decode.bind(described_namespace);

    it("requires a 26-character Crockford32 string", () => {
      expect(() => subject(undefined as unknown as string)).toThrow(
        InvalidEncoding,
      );
      expect(() => subject(encoding_any.slice(0, -1))).toThrow(
        InvalidEncoding,
      );
      expect(() =>
        subject(encoding_any + makeString(1, ALPHABET.CROCKFORD32)),
      ).toThrow(InvalidEncoding);
      expect(() => subject(encoding_any)).not.toThrow();
    });
  });

  describe(".decodeTrusted extended", () => {
    const subject = described_namespace.decodeTrusted.bind(described_namespace);

    it("ignores case", () => {
      const encoding =
        makeString(1, "01234567") +
        makeString(
          25,
          ALPHABET.CROCKFORD32 + ALPHABET.CROCKFORD32.toLowerCase(),
        );

      expect(subject(encoding)).toEqual(subject(encoding.toUpperCase()));
      expect(subject(encoding)).toEqual(subject(encoding.toLowerCase()));
    });

    it("converts visually similar characters", () => {
      const encoding = encoding_any.slice(0, -1);
      const conversions: Array<[string, string]> = [
        ["i", "1"],
        ["I", "1"],
        ["l", "1"],
        ["L", "1"],
        ["o", "0"],
        ["O", "0"],
        ["u", "V"],
        ["U", "V"],
      ];

      for (const [character, replacement] of conversions) {
        expect(subject(encoding + character)).toEqual(
          subject(encoding + replacement),
        );
      }
    });
  });

  assertEncode({
    described_namespace,
    encoding_any,
    encoding_max,
    encoding_min,
  });
});
