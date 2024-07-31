import type {StackId} from 'earwurm';

import {type SynthType, SynthTypeValues} from '@/types';

export function assertSynthType(id = ''): id is SynthType {
  const comparableArray: string[] = [...SynthTypeValues];
  return comparableArray.includes(id);
}

export function assertSynthValues(keys: StackId[]): keys is SynthType[] {
  return keys.every((key) => assertSynthType(key));
}

export function filterSynthValues(keys: StackId[]): SynthType[] {
  // Using `filter()` does not appear to work.
  // keys.filter((key) => assertSynthType(key));

  return assertSynthValues(keys) ? keys : [];
}
