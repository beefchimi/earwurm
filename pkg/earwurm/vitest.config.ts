import {defineConfig, mergeConfig} from 'vitest/config';
import earuwrmViteConfig from './vite.config';

export default mergeConfig(
  earuwrmViteConfig,
  defineConfig({
    test: {
      setupFiles: 'config/tests-setup',
      sequence: {
        concurrent: true,
      },
    },
  }),
);
