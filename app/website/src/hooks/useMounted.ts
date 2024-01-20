import {getCurrentInstance, onMounted, ref} from 'vue';

// Adapted from Vue Use: https://vueuse.org/
export function useMounted() {
  const isMounted = ref(false);

  if (getCurrentInstance()) {
    onMounted(() => {
      isMounted.value = true;
    });
  }

  return isMounted;
}
