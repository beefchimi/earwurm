# Temporary

This file exists until we have finished our `eslint` migration.

## contributing.md

```md
- `format` checks the codebase for `prettier` errors, but does not fix them.
- `format:fix` automatically fixes any `prettier` errors that can be programatically resolved.
```

## Root package.json

```json
{
  "lint": "pnpm -r lint && eslint .",
  "lint:fix": "pnpm -r lint:fix && eslint . --fix",
  "format": "prettier --check .",
  "format:fix": "prettier --write .",
}
```

## Website package.json

```json
{
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
}
```

## Website eslint config

```mjs
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

// import vueParser from 'vue-eslint-parser';
// import tsParser from '@typescript-eslint/parser';
// import tsPlugin from '@typescript-eslint/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// TODO: This config currently is not working... as we do not appear
// to end up with the correct parser.
export default [
  {
    // ignores: ['.nx/cache', 'coverage/**', 'dist/**', 'scrap/**'],

    // We want the root `eslint` config to handle everything outside
    // of this folder, so we will ignore everything except `/app`.
    // ignores: ['**/*', '!app/**/*/'],

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

    // Taken from:
    // https://github.com/vuejs/vue-eslint-parser/issues/232
    /*
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
      },
      ecmaVersion: 'latest',
    },
    */

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
```

## Prettier

```json
{
  "bracketSpacing": false,
  "singleQuote": true
}
```

## Prettier ignore

```
package-lock.json
pnpm-lock.yaml
tsconfig.json
tsconfig.*.json
.changeset/*.md
```
