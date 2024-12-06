import {defineConfig, mergeConfig} from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      setupFiles: 'config/tests-setup',
      sequence: {
        concurrent: true,
      },
    },
  }),
);
