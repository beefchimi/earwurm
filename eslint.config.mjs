// eslint.config.js
import antfu from '@antfu/eslint-config';

// References:
// 1. https://github.com/antfu/eslint-config
// 2. https://github.com/antfu/eslint-plugin-antfu
// 3. https://github.com/antfu/eslint-plugin-format
export default antfu({
  // The default is 'app', but we might want to
  // use `lib` here and `app` within `/website`.
  // type: 'lib',

  // In case we want to use a custom config within `website`: 'app/**'
  ignores: ['.nx/cache', 'coverage/**', 'dist/**', 'scrap/**', 'app/**'],

  formatters: {
    // Formats .css and .scss files, but also the `<style>` blocks in Vue.
    css: true,
    markdown: true,
  },

  stylistic: {
    semi: true,
  },

  typescript: {
    tsconfigPath: 'tsconfig.json',
    // overrides: {},
  },

  // vue: {overrides: {}},
}, {
  // Without a `files` scope, these rules will apply to everything.
  rules: {
    'antfu/if-newline': 'off',
    'no-console': 'warn',
    'style/arrow-parens': ['error', 'always'],
    'style/object-curly-spacing': ['error', 'never'],
    'test/prefer-lowercase-title': 'off',
    'ts/strict-boolean-expressions': 'off',

    // TODO: Try and solve broken if/else statements.
    /*
    'style/padding-line-between-statements': [
      'error',
      {blankLine: 'never', prev: 'if', next: 'block-like'},
    ],
    */
  },
});
