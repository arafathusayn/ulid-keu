import { BaseCoder } from "../coder/base";
import { BaseId } from "../id/base";

export interface IdClass<T extends BaseId> {
  new (bytes: Uint8Array): T;
  readonly name: string;
  generate(...args: unknown[]): T;
  MIN(...args: unknown[]): T;
  MAX(...args: unknown[]): T;
}

export interface EncodableId extends BaseId {
  toCanonical(): string;
  toRaw(): string;
}

type EncodableIdClass<T extends BaseId> = IdClass<T & EncodableId>;

interface SpeciesHost<T extends BaseId> {
  [Symbol.species]: IdClass<T>;
}

function createEncodableClass<T extends BaseId>(
  id: IdClass<T>,
  canonical_coder: BaseCoder,
  raw_coder: BaseCoder,
): EncodableIdClass<T> {
  // Build a proper subclass using Reflect.construct so ES class constructors work.
  // We cannot use `class extends id` directly because `id` is a generic parameter.

  const proto = Object.create(id.prototype) as T & EncodableId;

  proto.toCanonical = function toCanonical(this: BaseId): string {
    return canonical_coder.encodeTrusted(this.bytes);
  };

  proto.toRaw = function toRaw(this: BaseId): string {
    return raw_coder.encodeTrusted(this.bytes);
  };

  Object.defineProperty(proto, Symbol.toStringTag, {
    get(this: EncodableId): string {
      return `${id.name} ${this.toRaw()}`;
    },
  });

  // Use a named function so `.name` works, then override it.
  const ctor = function EncodableId(
    this: T & EncodableId,
    ...args: unknown[]
  ): T & EncodableId {
    // Reflect.construct properly handles ES class constructors
    const instance = Reflect.construct(
      id,
      args,
      new.target || ctor,
    ) as T & EncodableId;
    return instance;
  };

  ctor.prototype = proto;
  proto.constructor = ctor;

  // Inherit static methods (generate, MIN, MAX, etc.)
  Object.setPrototypeOf(ctor, id);

  Object.defineProperty(ctor, "name", { value: id.name });
  Object.defineProperty(ctor, Symbol.species, {
    get(): IdClass<T> {
      return id;
    },
  });

  // TypeScript cannot express a function constructor with `new` semantics
  // and Symbol.species in the same type without an intermediate cast.
  // This is a fundamental limitation when dynamically creating class hierarchies.
  return ctor as unknown as EncodableIdClass<T>;
}

export class IdFactory<T extends BaseId> {
  private _id: EncodableIdClass<T>;
  private _canonical_coder: BaseCoder;
  private _raw_coder: BaseCoder;

  constructor({
    id,
    canonical_coder,
    raw_coder,
  }: {
    id: IdClass<T>;
    canonical_coder: BaseCoder;
    raw_coder: BaseCoder;
  }) {
    this._id = createEncodableClass(id, canonical_coder, raw_coder);
    this._canonical_coder = canonical_coder;
    this._raw_coder = raw_coder;
  }

  // Properties

  get name(): string {
    return this._id.name;
  }

  get type(): IdClass<T> {
    return (this._id as unknown as SpeciesHost<T>)[Symbol.species];
  }

  // Generators

  construct(bytes: Uint8Array): T & EncodableId {
    return new this._id(bytes);
  }

  generate(...args: unknown[]): T & EncodableId {
    return this._id.generate(...args);
  }

  MIN(...args: unknown[]): T & EncodableId {
    return this._id.MIN(...args);
  }

  MAX(...args: unknown[]): T & EncodableId {
    return this._id.MAX(...args);
  }

  // Coders

  fromCanonical(canonical: string): T & EncodableId {
    return this.construct(this._canonical_coder.decode(canonical));
  }

  fromCanonicalTrusted(canonical: string): T & EncodableId {
    return this.construct(this._canonical_coder.decodeTrusted(canonical));
  }

  fromRaw(raw: string): T & EncodableId {
    return this.construct(this._raw_coder.decode(raw));
  }

  fromRawTrusted(raw: string): T & EncodableId {
    return this.construct(this._raw_coder.decodeTrusted(raw));
  }

  toCanonical(id: T): string {
    return this._canonical_coder.encode(id.bytes);
  }

  toRaw(id: T): string {
    return this._raw_coder.encode(id.bytes);
  }

  // Verifiers

  isCanonical(canonical: string): boolean {
    return this._canonical_coder.isValidEncoding(canonical);
  }

  isRaw(raw: string): boolean {
    return this._raw_coder.isValidEncoding(raw);
  }
}
