import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {resolve} from 'path';

import rootViteConfig from '../../vite.config';
import pkg from './package.json';

export default defineConfig({
  ...rootViteConfig,
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'earwurm',
      fileName: (format) => `earwurm.${format}.js`,
    },
    rollupOptions: {
      // We might need to define global variables
      // to use in the UMD build.
      external: Object.keys(pkg.peerDependencies || {}),
    },
    minify: false,
  },
  plugins: [
    dts({
      // Will capture only the types that are exposed to consumers
      // and condense them all into a single file. If we also want
      // unexported types, as well as their folder structure, then
      // replace `rollupTypes` with `insertTypesEntry`.
      rollupTypes: true,
    }),
  ],
});
