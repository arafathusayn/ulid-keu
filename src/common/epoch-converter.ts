import { InvalidEpoch } from "./exception";

const MIN_MS = 0;
const MAX_MS = Math.pow(2, 48);

export function fromEpoch(origin_ms: number, epoch_ms: number): Date {
  return new Date(epoch_ms + origin_ms);
}

export function toEpoch(
  origin_ms: number,
  time: Date | number | null | undefined = null,
): number {
  let coerced_ms: number;

  if (time === null || time === undefined) {
    coerced_ms = Date.now();
  } else if (typeof time === "number" && Number.isInteger(time)) {
    coerced_ms = time;
  } else if (time instanceof Date) {
    coerced_ms = time.getTime();
  } else {
    throw new InvalidEpoch(`Failed to coerce time [${String(time)}] to epoch`);
  }

  const epoch_ms = coerced_ms - origin_ms;

  if (epoch_ms < MIN_MS || epoch_ms >= MAX_MS) {
    const min_iso = new Date(MIN_MS + origin_ms).toISOString();
    const max_iso = new Date(MAX_MS - 1 + origin_ms).toISOString();
    throw new InvalidEpoch(
      `Epoch must be between ${min_iso} and ${max_iso}`,
    );
  }

  return epoch_ms;
}
