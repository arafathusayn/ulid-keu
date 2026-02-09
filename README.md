# KEU

Generate 128-bit unique monotonic identifiers based on the [ULID spec](https://github.com/ulid/spec).

Written in TypeScript. Zero runtime dependencies.

## Install

```bash
npm install keu
```

## Usage

```ts
import { UlidMonotonic, idCompare, idEqual } from "keu";

// Generate a new monotonic ULID
const id = UlidMonotonic.generate();

// Get the smallest / largest valid id
const min = UlidMonotonic.MIN();
const max = UlidMonotonic.MAX();

// Type-check the id
console.log(id instanceof UlidMonotonic.type);

// Compare ids
console.log(id.equal(id)); // true
console.log(id.compare(min) === 1); // true
console.log(id.compare(max) === -1); // true

// Encode as canonical Crockford32 string
const canonical = id.toCanonical();
console.log(canonical); // e.g. "01ARZ3NDEKTSV4RRFFQ69G5FAV"

// Encode as raw hex string
const raw = id.toRaw();
console.log(raw);

// Decode from canonical or raw
const decoded = UlidMonotonic.fromCanonical(canonical);
console.log(id.equal(decoded)); // true

// Verify format
console.log(UlidMonotonic.isCanonical(canonical)); // true
console.log(UlidMonotonic.isRaw(raw)); // true

// Compare arbitrary ids
console.log(idCompare(min, max)); // -1
console.log(idEqual(id, id)); // true
```

## UlidMonotonic

Inspired by the ULID [monotonicity specification](https://github.com/ulid/spec#monotonicity):

- **collision resistant**: 15-bits of random seeded clock sequence plus 64-bits of randomness
- **total ordered**: prefixed with millisecond precision timestamp plus 15-bit clock sequence
- **database friendly**: fits within a UUID and generally appends to the index
- **human friendly**: canonically encodes as a case-insensitive Crockford 32 number

### Instance Properties

#### bytes

Return the actual byte array representing the id.

#### time

Return a Date object for the epoch milliseconds encoded in the id.

### Factory Methods

#### .generate({ time }) => id

Return a new id instance. `time` defaults to the current time. It can be given
either as a `Date` or epoch milliseconds (ms since January 1st, 1970).

Throws `InvalidEpoch` for times before the epoch or after ~August 2nd, 10889.
Throws `ClockSequenceOverflow` when the clock sequence is exhausted.

#### .MIN() => id

Return the id with the smallest valid value.

#### .MAX() => id

Return the id with the largest valid value.

#### .construct(bytes) => id

Return a new id instance without validating the bytes.

#### .fromCanonical(canonical_string) => id

Decode an id from its canonical Crockford32 representation.
Throws `InvalidEncoding` if the string is undecodable.

#### .fromCanonicalTrusted(canonical_string) => id

Decode an id from its canonical representation, skipping validation.

#### .fromRaw(raw_string) => id

Decode an id from its raw hex representation.
Throws `InvalidEncoding` if the string is undecodable.

#### .fromRawTrusted(raw_string) => id

Decode an id from its raw representation, skipping validation.

#### .toCanonical(id) => string

Encode the given id in canonical Crockford32 form.

#### .toRaw(id) => string

Encode the given id in raw hex form.

#### .isCanonical(string) => boolean

Verify if a string is a valid canonical encoding.

#### .isRaw(string) => boolean

Verify if a string is a valid raw encoding.

#### .reset()

Return the clock sequence to its starting position. Provided mostly for unit tests.

### Instance Methods

#### .clone() => deep_copy

Return a new instance with the same byte signature.

#### .compare(other) => (-1 | 0 | 1)

Determine how this id is ordered against another.

#### .equal(other) => boolean

Determine if this id has the same bytes as another.

#### .toCanonical() => string

Encode this id in canonical Crockford32 form.

#### .toRaw() => string

Encode this id in raw hex form.

### Byte Format

Format `tttt tttt tttt cccc rrrr rrrr rrrr rrrr` where:

- `t` is 4 bits of time
- `c` is 4 bits of random-seeded clock sequence
- `r` is 4 bits of random

The clock sequence is a counter. When the first id for a new timestamp is
generated, the clock sequence is seeded with random bits and the left-most
clock sequence bit is set to 0, reserving 2^15 clock ticks. Whenever a time
from the past seeds the generator, the previous id's time and clock sequence
are used instead, with the clock sequence incremented by 1.

## Static Utilities

### idCompare(left, right) => (-1 | 0 | 1)

Determine ordering using lexicographical byte order.

### idEqual(left, right) => boolean

Determine if two ids have the same byte value.

## Exceptions

```ts
import { Exception } from "keu";
```

All exceptions are namespaced under `Exception`:

- **Id128Error** - Base exception class
- **ClockSequenceOverflow** - Clock sequence exhausted
- **InvalidBytes** - Encoding something other than 16 bytes
- **InvalidEncoding** - Decoding an invalid format
- **InvalidEpoch** - Generating an id with an invalid timestamp

## Advanced Exports

For building custom ID types:

```ts
import {
  UlidMonotonicClass,
  UlidClass,
  BaseId,
  IdFactory,
  BaseCoder,
  Crockford32Coder,
  HexCoder,
} from "keu";
```

## Browser Support

This module supports browser bundlers (Webpack, etc.) with the `browser` field
in `package.json` swapping the Node.js `crypto` module for `globalThis.crypto`.

## Tests

```bash
bun test
```

## License

MIT

## Acknowledgments

- [ksuid](https://github.com/segmentio/ksuid): guid nuances
- [ulid](https://github.com/ulid/javascript): elegant ULID solution
- [uuid-random](https://github.com/jchook/uuid-random): page-buffered randomness
- [ruleb](https://github.com/ruleb): worker support research
