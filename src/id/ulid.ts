import * as ByteArray from "../common/byte-array";
import * as EpochConverter from "../common/epoch-converter";
import { BaseId } from "./base";

const TIME_OFFSET = 0;

const EPOCH_ORIGIN_MS = 0;
const UINT32_RADIX = Math.pow(2, 32);
const UINT8_MAX = 0b11111111;

export interface UlidGenerateOptions {
  time?: Date | number | null;
}

function getByte(bytes: Uint8Array, idx: number): number {
  return bytes[idx] ?? 0;
}

export function setTime(time: number, bytes: Uint8Array): void {
  const time_low = time % UINT32_RADIX;
  const time_high = (time - time_low) / UINT32_RADIX;

  let idx = TIME_OFFSET - 1;
  bytes[++idx] = (time_high >>> 8) & UINT8_MAX;
  bytes[++idx] = (time_high >>> 0) & UINT8_MAX;
  bytes[++idx] = (time_low >>> 24) & UINT8_MAX;
  bytes[++idx] = (time_low >>> 16) & UINT8_MAX;
  bytes[++idx] = (time_low >>> 8) & UINT8_MAX;
  bytes[++idx] = (time_low >>> 0) & UINT8_MAX;
}

export class Ulid extends BaseId {
  static generate({ time }: UlidGenerateOptions = {}): Ulid {
    const epoch = EpochConverter.toEpoch(EPOCH_ORIGIN_MS, time);
    const bytes = ByteArray.generateRandomFilled();
    setTime(epoch, bytes);
    return new this(bytes);
  }

  static MIN(): Ulid {
    return new this(ByteArray.generateZeroFilled());
  }

  static MAX(): Ulid {
    return new this(ByteArray.generateOneFilled());
  }

  get time(): Date {
    let idx = TIME_OFFSET - 1;
    const time_high =
      0 | (getByte(this.bytes, ++idx) << 8) | (getByte(this.bytes, ++idx) << 0);
    const time_low =
      0 |
      (getByte(this.bytes, ++idx) << 24) |
      (getByte(this.bytes, ++idx) << 16) |
      (getByte(this.bytes, ++idx) << 8) |
      (getByte(this.bytes, ++idx) << 0);
    const epoch_ms = time_high * UINT32_RADIX + (time_low >>> 0);

    return EpochConverter.fromEpoch(EPOCH_ORIGIN_MS, epoch_ms);
  }
}
