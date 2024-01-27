import {computed} from 'vue';
import {useMounted} from './useMounted';

// Adapted from Vue Use: https://vueuse.org/
export function useSupported(callback: () => boolean) {
  const isMounted = useMounted();

  return computed(() => {
    // This useless expression is needed in order to trigger the ref.
    isMounted.value;
    return Boolean(callback());
  });
}
