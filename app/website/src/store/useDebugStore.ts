import {computed} from 'vue';

function getSearchParams() {
  const rawParams = window.location.search || '';
  return new URLSearchParams(rawParams);
}

export function useDebugStore() {
  const params = getSearchParams();
  return computed(() => params.has('mode', 'debug'));
}
