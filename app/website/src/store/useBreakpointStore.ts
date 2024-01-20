import {computed} from 'vue';
import {useMediaQuery} from '@/hooks';

const tablet = useMediaQuery('(min-width: 636px)');
const desktop = useMediaQuery('(min-width: 960px)');

export function useBreakpointStore() {
  return {
    tablet: computed(() => tablet.value),
    desktop: computed(() => desktop.value),
  };
}
