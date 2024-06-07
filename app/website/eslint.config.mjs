import globals from 'globals';
import configLove from 'eslint-config-love';
// Includes both `config` and `plugin`.
import pluginPrettier from 'eslint-plugin-prettier/recommended';

// TODO: Update this once the various `vue > eslint` packages
// fully support the new flat config.
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {FlatCompat} from '@eslint/eslintrc';
import pluginVue from 'eslint-plugin-vue';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// TODO: This config currently is not working... as we do not appear
// to end up with the correct parser.
export default [
  {
    ignores: ['.nx/cache', 'coverage/**', 'dist/**', 'scrap/**'],
  },

  configLove,
  pluginPrettier,

  ...pluginVue.configs['flat/essential'],
  ...compat.extends('@vue/eslint-config-typescript/recommended'),
  ...compat.extends('@vue/eslint-config-prettier/skip-formatting'),

  {
    name: 'vue-rules',
    files: ['**/*.vue', '**/*.ts', '**/*.mjs'],

    languageOptions: {
      ...configLove.languageOptions,
      globals: {
        ...globals.browser,
      },
      // ecmaVersion: 2022,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      'no-console': 'warn',

      // TODO: Get this import rule working.
      // https://github.com/import-js/eslint-plugin-import/blob/HEAD/docs/rules/no-duplicates.md
      /*
      'import/no-duplicates': [
        'error',
        {'prefer-inline': true},
      ],
      */

      'vue/multi-word-component-names': [
        'error',
        {ignores: ['Thumbnail', 'Tooltip']},
      ],
      'vue/no-undef-components': ['error'],

      // TODO: Remove these rules once their feature is
      // no longer experimental.
      'vue/no-setup-props-destructure': 'off',
    },
  },
];
