// eslint.config.js
import antfu from '@antfu/eslint-config'

// References:
// 1. https://github.com/antfu/eslint-config
// 2. https://github.com/antfu/eslint-plugin-antfu
// 3. https://github.com/antfu/eslint-plugin-format
export default antfu({
  // The default is 'app', but we might want to
  // use `lib` here and `app` within `/website`.
  // type: 'lib',

  // Enable stylistic formatting rules
  // stylistic: true,

  // Or customize the stylistic rules

  /*
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  */

  typescript: {
    tsconfigPath: 'tsconfig.json',
  },

  // Enable if we find Vue is not being autodetected.
  // vue: true,

  // In case we want to use a custom config within `website`: 'app/**'
  ignores: ['.nx/cache', 'coverage/**', 'dist/**', 'scrap/**'],

  formatters: {
    // Formats .css and .scss files, but also the `<style>` blocks in Vue.
    css: true,
    markdown: true,
  },
})

/*
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
    },
*/
