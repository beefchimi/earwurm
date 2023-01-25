import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'earwurm',
      fileName: (format) => `earwurm.${format}.js`,
    },
    minify: false,
  },
  plugins: [dts()],
});
