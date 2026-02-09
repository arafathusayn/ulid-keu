import { InvalidEncoding, InvalidBytes } from "../common/exception";

export class BaseCoder {
  private _valid_encoding_pattern: RegExp;

  constructor({ valid_encoding_pattern }: { valid_encoding_pattern: RegExp }) {
    this._valid_encoding_pattern = valid_encoding_pattern;
  }

  decode(encoding: string): Uint8Array {
    if (this.isValidEncoding(encoding)) {
      return this.decodeTrusted(encoding);
    } else {
      throw new InvalidEncoding(
        `Encoding [${encoding}] does not satisfy ${String(this._valid_encoding_pattern)}`,
      );
    }
  }

  decodeTrusted(_encoding: string): Uint8Array {
    return new Uint8Array(16);
  }

  encode(bytes: Uint8Array): string {
    if (this.isValidBytes(bytes)) {
      return this.encodeTrusted(bytes);
    } else {
      throw new InvalidBytes("Requires a 16-byte Uint8Array");
    }
  }

  encodeTrusted(_bytes: Uint8Array): string {
    return "";
  }

  isValidBytes(bytes: unknown): bytes is Uint8Array {
    return bytes instanceof Uint8Array && bytes.length === 16;
  }

  isValidEncoding(encoding: unknown): encoding is string {
    return (
      (typeof encoding === "string" || encoding instanceof String) &&
      this._valid_encoding_pattern.test(
        typeof encoding === "string" ? encoding : encoding.toString(),
      )
    );
  }
}
