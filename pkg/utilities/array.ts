import type {PrimitiveType} from '@earwurm/types';

export function arrayOfLength(length = 0): number[] {
  return Array.from(Array(length)).map((_item, index) => index);
}

export function arrayShallowEquals(one: PrimitiveType[], two: PrimitiveType[]) {
  const equalLength = one.length === two.length;
  return equalLength && one.every((value, index) => value === two[index]);
}
