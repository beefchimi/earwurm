import {URL, fileURLToPath} from 'node:url';

import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import createSvgSpritePlugin from 'vite-plugin-svg-sprite';

import {mixinAtRules, mixinVisitor} from './lightningcss-plugins';

export default defineConfig({
  base: '/earwurm/',
  build: {
    cssMinify: 'lightningcss',
    // minify: false,
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      drafts: {
        customMedia: true,
      },
      // targets: browserslistToTargets(browserslist('>= 0.25%')),

      // @ts-expect-error: No overloads
      customAtRules: mixinAtRules,
      visitor: mixinVisitor,

      // It would be ideal if we could tree-shake unused utility classes.
      // Lightning CSS is not able to determine this by itself.
      // unusedSymbols: ['foo', '--bar']
    },
  },
  plugins: [
    // May need to customize experimental features for Vue:
    // {script: {propsDestructure: true}}
    vue(),
    createSvgSpritePlugin({svgo: false}),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
