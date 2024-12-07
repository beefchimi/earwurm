import {defineConfig, mergeConfig} from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      setupFiles: 'config/tests-setup',
      // Not running tests concurrently because we would
      // need to refactor many tests to more thoroughly reset
      // between each test.
      // sequence: {concurrent: true},
    },
  }),
);
