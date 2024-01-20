import {getCurrentScope, onScopeDispose, unref} from 'vue';
import type {AnyFn, Fn} from '@earwurm/types';
import type {MaybeRefOrGetter} from '@/types';

// Adapted from Vue Use: https://vueuse.org/

export function toValue<T>(something: MaybeRefOrGetter<T>): T {
  return typeof something === 'function'
    ? (something as AnyFn)()
    : unref(something);
}

export function tryOnScopeDispose(callback: Fn) {
  if (getCurrentScope()) {
    onScopeDispose(callback);
    return true;
  }

  return false;
}
