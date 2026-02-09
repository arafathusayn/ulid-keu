import { BaseCoder } from "./base";

const ALPHABET = "0123456789ABCDEF";

const BYTE_TO_HEX: string[] = Array.from(
  { length: ALPHABET.length * ALPHABET.length },
  (_, key) =>
    ALPHABET.charAt(key / ALPHABET.length) +
    ALPHABET.charAt(key % ALPHABET.length),
);

const HEX_TO_BYTE: Record<string, number> = Array.from(ALPHABET).reduce<
  Record<string, number>
>((mapping, hex, idx) => {
  mapping[hex.toUpperCase()] = idx;
  mapping[hex.toLowerCase()] = idx;
  return mapping;
}, Object.create(null));

class HexCoder extends BaseCoder {
  constructor() {
    super({
      valid_encoding_pattern: /^[0-9A-Fa-f]{32}$/,
    });
  }

  override decodeTrusted(encoding: string): Uint8Array {
    const bytes = new Uint8Array(16);

    for (
      let dst = 0, hi_hex = true, src = 0, end = encoding.length;
      src < end;
      ++src
    ) {
      const hex = encoding.charAt(src);
      const val = HEX_TO_BYTE[hex] ?? 0;
      if (hi_hex) {
        bytes[dst] = val << 4;
      } else {
        bytes[dst] = (bytes[dst] ?? 0) | val;
        dst++;
      }
      hi_hex = !hi_hex;
    }

    return bytes;
  }

  override encodeTrusted(bytes: Uint8Array): string {
    let encoding = "";
    for (let idx = 0, end = bytes.length; idx < end; ++idx) {
      encoding += BYTE_TO_HEX[bytes[idx] ?? 0] ?? "00";
    }
    return encoding;
  }
}

export default new HexCoder();
