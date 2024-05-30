import globals from 'globals';
import configLove from 'eslint-config-love';
// Includes both `config` and `plugin`.
import pluginPrettier from 'eslint-plugin-prettier/recommended';

export default [
  {
    ignores: ['.nx/cache', 'coverage/**', 'dist/**', 'scrap/**'],
  },
  configLove,
  pluginPrettier,
  {
    name: 'root-rules',
    files: ['**/*.ts', '**/*.js', '**/*.mjs'],
    languageOptions: {
      ...configLove.languageOptions,
      globals: {
        ...globals.browser,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
    },
  },
];
