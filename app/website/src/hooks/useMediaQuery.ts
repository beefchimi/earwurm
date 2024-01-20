import {ref, watchEffect} from 'vue';
import {supportMatchMedia} from '@earwurm/utilities';

import type {MaybeRefOrGetter} from '@/types';
import {toValue, tryOnScopeDispose} from '@/helpers';

import {useSupported} from './useSupported';

// Adapted from Vue Use: https://vueuse.org/
export function useMediaQuery(query: MaybeRefOrGetter<string>) {
  const isSupported = useSupported(supportMatchMedia);

  let mediaQuery: MediaQueryList | undefined;
  const matches = ref(false);

  function handler(event: MediaQueryListEvent) {
    matches.value = event.matches;
  }

  function cleanup() {
    if (!mediaQuery) return;
    mediaQuery.removeEventListener('change', handler);
  }

  const stopWatch = watchEffect(() => {
    if (!isSupported.value) return;

    cleanup();

    mediaQuery = window.matchMedia(toValue(query));
    mediaQuery.addEventListener('change', handler);
    matches.value = mediaQuery.matches;
  });

  tryOnScopeDispose(() => {
    stopWatch();
    cleanup();
    mediaQuery = undefined;
  });

  return matches;
}
