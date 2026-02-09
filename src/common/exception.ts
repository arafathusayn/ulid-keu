export class Id128Error extends Error {
  get name(): string {
    return this.constructor.name;
  }
}

export class ClockSequenceOverflow extends Id128Error {}
export class InvalidBytes extends Id128Error {}
export class InvalidEncoding extends Id128Error {}
export class InvalidEpoch extends Id128Error {}
