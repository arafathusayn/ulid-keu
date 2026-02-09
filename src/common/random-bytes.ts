import * as Crypto from "crypto";

const BUFFER_SIZE = 4096 /* typical page size */ - 96; /* Empty buffer overhead */

const buffer = new Uint8Array(BUFFER_SIZE);
let offset = BUFFER_SIZE;

export function randomBytes(size: number): Uint8Array {
  if (offset + size >= BUFFER_SIZE) {
    offset = 0;
    Crypto.randomFillSync(buffer);
  }

  return buffer.slice(offset, (offset += size));
}
