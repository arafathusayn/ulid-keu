import { Ulid, setTime, UlidGenerateOptions } from "./ulid";
import * as ByteArray from "../common/byte-array";
import * as EpochConverter from "../common/epoch-converter";
import { ClockSequenceOverflow } from "../common/exception";

const TIME_OFFSET = 0;
const CLOCK_SEQUENCE_OFFSET = 6;
const RANDOM_OFFSET = 8;

const EPOCH_ORIGIN_MS = 0;

let _previous_id: UlidMonotonic;
let _previous_time: number;

function incrementClockSequence(bytes: Uint8Array): void {
  for (
    let idx = RANDOM_OFFSET - 1, end = CLOCK_SEQUENCE_OFFSET - 1;
    idx > end;
    --idx
  ) {
    if (bytes[idx] === 0xff) {
      bytes[idx] = 0;
    } else {
      bytes[idx] = (bytes[idx] ?? 0) + 1;
      return;
    }
  }

  throw new ClockSequenceOverflow("Exhausted clock sequence");
}

function reserveClockSequence(bytes: Uint8Array): void {
  bytes[CLOCK_SEQUENCE_OFFSET] = (bytes[CLOCK_SEQUENCE_OFFSET] ?? 0) & 0b01111111;
}

function restoreClockSequence(bytes: Uint8Array): void {
  for (let idx = TIME_OFFSET; idx < RANDOM_OFFSET; ++idx) {
    bytes[idx] = _previous_id.bytes[idx] ?? 0;
  }
}

export class UlidMonotonic extends Ulid {
  static reset(): void {
    _previous_time = -1;
    _previous_id = this.MIN();
  }

  static override generate({ time }: UlidGenerateOptions = {}): UlidMonotonic {
    const epoch = EpochConverter.toEpoch(EPOCH_ORIGIN_MS, time);
    const bytes = ByteArray.generateRandomFilled();

    if (epoch <= _previous_time) {
      restoreClockSequence(bytes);
      incrementClockSequence(bytes);
    } else {
      setTime(epoch, bytes);
      reserveClockSequence(bytes);
      _previous_time = epoch;
    }

    return (_previous_id = new this(bytes));
  }

  static override MIN(): UlidMonotonic {
    return new this(ByteArray.generateZeroFilled());
  }

  static override MAX(): UlidMonotonic {
    return new this(ByteArray.generateOneFilled());
  }
}

UlidMonotonic.reset();
