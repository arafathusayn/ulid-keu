import { BaseCoder } from "./base";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const MAX_QUINTET = 0b11111;

const CHAR_TO_QUINTET: Record<string, number> = Array.from(ALPHABET).reduce<
  Record<string, number>
>(
  (acc, chr, idx) => {
    acc[chr] = idx;
    acc[chr.toLowerCase()] = idx;
    return acc;
  },
  {
    I: ALPHABET.indexOf("1"),
    i: ALPHABET.indexOf("1"),
    L: ALPHABET.indexOf("1"),
    l: ALPHABET.indexOf("1"),
    O: ALPHABET.indexOf("0"),
    o: ALPHABET.indexOf("0"),
    U: ALPHABET.indexOf("V"),
    u: ALPHABET.indexOf("V"),
  },
);
const QUINTET_TO_CHAR: string[] = Array.from(ALPHABET);

function charToQuintet(chr: string): number {
  return CHAR_TO_QUINTET[chr] ?? 0;
}

function quintetToChar(quintet: number): string {
  return QUINTET_TO_CHAR[quintet & MAX_QUINTET] ?? "0";
}

function b(bytes: Uint8Array, idx: number): number {
  return bytes[idx] ?? 0;
}

function q(quintets: number[], idx: number): number {
  return quintets[idx] ?? 0;
}

class Crockford32Coder extends BaseCoder {
  constructor() {
    super({
      valid_encoding_pattern: /^[0-7][^\W_]{25}$/,
    });
  }

  decodeTrusted(encoding: string): Uint8Array {
    const bytes = new Uint8Array(16);
    const quintets: number[] = [];

    for (let idx = 0, end = encoding.length; idx < end; ++idx) {
      quintets.push(charToQuintet(encoding.charAt(idx)));
    }

    // Note: unrolled for performance
    bytes[0] = (q(quintets, 0) << 5) | q(quintets, 1);

    bytes[1] = (q(quintets, 2) << 3) | (q(quintets, 3) >> 2);
    bytes[2] =
      (q(quintets, 3) << 6) | (q(quintets, 4) << 1) | (q(quintets, 5) >> 4);
    bytes[3] = (q(quintets, 5) << 4) | (q(quintets, 6) >> 1);
    bytes[4] =
      (q(quintets, 6) << 7) | (q(quintets, 7) << 2) | (q(quintets, 8) >> 3);
    bytes[5] = (q(quintets, 8) << 5) | q(quintets, 9);

    bytes[6] = (q(quintets, 10) << 3) | (q(quintets, 11) >> 2);
    bytes[7] =
      (q(quintets, 11) << 6) |
      (q(quintets, 12) << 1) |
      (q(quintets, 13) >> 4);
    bytes[8] = (q(quintets, 13) << 4) | (q(quintets, 14) >> 1);
    bytes[9] =
      (q(quintets, 14) << 7) |
      (q(quintets, 15) << 2) |
      (q(quintets, 16) >> 3);
    bytes[10] = (q(quintets, 16) << 5) | q(quintets, 17);

    bytes[11] = (q(quintets, 18) << 3) | (q(quintets, 19) >> 2);
    bytes[12] =
      (q(quintets, 19) << 6) |
      (q(quintets, 20) << 1) |
      (q(quintets, 21) >> 4);
    bytes[13] = (q(quintets, 21) << 4) | (q(quintets, 22) >> 1);
    bytes[14] =
      (q(quintets, 22) << 7) |
      (q(quintets, 23) << 2) |
      (q(quintets, 24) >> 3);
    bytes[15] = (q(quintets, 24) << 5) | q(quintets, 25);

    return bytes;
  }

  encodeTrusted(bytes: Uint8Array): string {
    // Note: unrolled for performance
    const quintets = [
      b(bytes, 0) >> 5,
      b(bytes, 0),

      b(bytes, 1) >> 3,
      (b(bytes, 1) << 2) | (b(bytes, 2) >> 6),
      b(bytes, 2) >> 1,
      (b(bytes, 2) << 4) | (b(bytes, 3) >> 4),
      (b(bytes, 3) << 1) | (b(bytes, 4) >> 7),
      b(bytes, 4) >> 2,
      (b(bytes, 4) << 3) | (b(bytes, 5) >> 5),
      b(bytes, 5),

      b(bytes, 6) >> 3,
      (b(bytes, 6) << 2) | (b(bytes, 7) >> 6),
      b(bytes, 7) >> 1,
      (b(bytes, 7) << 4) | (b(bytes, 8) >> 4),
      (b(bytes, 8) << 1) | (b(bytes, 9) >> 7),
      b(bytes, 9) >> 2,
      (b(bytes, 9) << 3) | (b(bytes, 10) >> 5),
      b(bytes, 10),

      b(bytes, 11) >> 3,
      (b(bytes, 11) << 2) | (b(bytes, 12) >> 6),
      b(bytes, 12) >> 1,
      (b(bytes, 12) << 4) | (b(bytes, 13) >> 4),
      (b(bytes, 13) << 1) | (b(bytes, 14) >> 7),
      b(bytes, 14) >> 2,
      (b(bytes, 14) << 3) | (b(bytes, 15) >> 5),
      b(bytes, 15),
    ];

    let encoding = "";
    for (let idx = 0, end = quintets.length; idx < end; ++idx) {
      encoding += quintetToChar(quintets[idx] ?? 0);
    }
    return encoding;
  }
}

export default new Crockford32Coder();
