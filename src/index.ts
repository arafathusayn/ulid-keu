import { UlidMonotonic as UlidMonotonicClass } from "./id/ulid-monotonic";
import { Ulid as UlidClass } from "./id/ulid";
import { BaseId } from "./id/base";
import { IdFactory } from "./factory/id";
import { BaseCoder } from "./coder/base";
import Crockford32Coder from "./coder/crockford32";
import HexCoder from "./coder/hex";
import * as Exception from "./common/exception";

const UlidMonotonic = new IdFactory({
  id: UlidMonotonicClass,
  canonical_coder: Crockford32Coder,
  raw_coder: HexCoder,
});

function idCompare(lhs: BaseId, rhs: BaseId): number {
  return lhs.compare(rhs);
}

function idEqual(lhs: BaseId, rhs: BaseId): boolean {
  return lhs.equal(rhs);
}

export {
  UlidMonotonic,
  idCompare,
  idEqual,
  Exception,
  UlidMonotonicClass,
  UlidClass,
  BaseId,
  IdFactory,
  BaseCoder,
  Crockford32Coder,
  HexCoder,
};
