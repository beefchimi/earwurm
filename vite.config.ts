import {defineConfig} from 'vite';

// Root-level config
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: 'config/tests-setup',
  },
});
