import type {Primitive} from '@earwurm/types';

export function arrayDedupe<T extends unknown[]>(...arrays: T[]) {
  // Not recursive (will not dedupe nested arrays).
  return [...new Set([...arrays.flat()])];
}

export function arrayOfLength(length = 0) {
  const safeLength = Math.max(0, length);
  const ghostArray = Array.from(Array(safeLength));

  return ghostArray.map((_item, index) => index);
}

export function arrayShallowEquals(one: Primitive[], two: Primitive[]) {
  const equalLength = one.length === two.length;
  return equalLength && one.every((value, index) => value === two[index]);
}

export function arrayShuffle<T>(array: T[]): T[] {
  return array
    .map((item) => ({sort: Math.random(), value: item}))
    .sort((one, two) => one.sort - two.sort)
    .map((item) => item.value);
}

export const typedObjectKeys = Object.keys as <T extends object>(
  obj: T,
) => Array<keyof T>;
