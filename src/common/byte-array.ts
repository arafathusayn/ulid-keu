import { randomBytes } from "./random-bytes";

const MAX_BYTES = 16;

export function compare(lhs: Uint8Array, rhs: Uint8Array): number {
  for (let idx = 0; idx < lhs.length; idx++) {
    const l = lhs[idx] ?? 0;
    const r = rhs[idx] ?? 0;
    if (l !== r) {
      return Math.sign(l - r);
    }
  }
  return 0;
}

export function generateOneFilled(): Uint8Array {
  return new Uint8Array(MAX_BYTES).fill(0xff);
}

export function generateRandomFilled(): Uint8Array {
  return randomBytes(MAX_BYTES);
}

export function generateZeroFilled(): Uint8Array {
  return new Uint8Array(MAX_BYTES).fill(0);
}
