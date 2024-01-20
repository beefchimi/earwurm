import {computed, ref} from 'vue';

type ThemeMode = 'light' | 'dark';
const theme = ref<ThemeMode>('light');

function toggleTheme() {
  const nextTheme = theme.value === 'light' ? 'dark' : 'light';
  theme.value = nextTheme;
  document.documentElement.dataset.theme = nextTheme;
}

export function useThemeStore() {
  return {
    theme: computed(() => theme.value),
    toggleTheme,
  };
}
