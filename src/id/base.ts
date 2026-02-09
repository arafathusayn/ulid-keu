import * as ByteArray from "../common/byte-array";

export class BaseId {
  private _bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  clone(): BaseId {
    return new (this.constructor as typeof BaseId)(this.bytes.slice());
  }

  get bytes(): Uint8Array {
    return this._bytes;
  }

  get [Symbol.toStringTag](): string {
    return this.constructor.name;
  }

  compare(rhs: BaseId): number {
    return ByteArray.compare(this.bytes, rhs.bytes);
  }

  equal(rhs: BaseId): boolean {
    return this.compare(rhs) === 0;
  }
}
