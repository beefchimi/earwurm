import {defineConfig} from 'vite';
// import {configDefaults} from 'vitest/config';

// Root-level config
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: 'config/tests-setup',
    // exclude: [...configDefaults.exclude, './app/**/*'],
    coverage: {
      exclude: ['app/**'],
    },
  },
});
