const BrowserCrypto = globalThis.crypto;

export function randomBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  BrowserCrypto.getRandomValues(bytes);
  return bytes;
}
