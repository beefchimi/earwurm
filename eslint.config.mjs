import antfu from '@antfu/eslint-config';

// References:
// 1. https://github.com/antfu/eslint-config
// 2. https://github.com/antfu/eslint-plugin-antfu
// 3. https://github.com/antfu/eslint-plugin-format
export default antfu(
  // Library config
  {
    type: 'lib',
    // Antfu respects `gitignore`, so we don't need to repeat those directories.
    ignores: ['app/**'],
    formatters: {
      markdown: true,
    },
    stylistic: {
      semi: true,
    },
    typescript: {
      tsconfigPath: 'tsconfig.json',
    },
    vue: false,
  },
  // General config
  {
    // Without a `files` scope, these rules will apply to everything.
    rules: {
      'antfu/if-newline': 'off',
      'no-console': 'warn',
      'style/arrow-parens': ['error', 'always'],
      'style/object-curly-spacing': ['error', 'never'],
      'test/prefer-lowercase-title': 'off',
      'ts/explicit-function-return-type': 'off',
      'ts/strict-boolean-expressions': 'off',
      // Would like this if I could differentiate between ternary and if conditions.
      // 'style/operator-linebreak': ['error', 'after'],

      // TODO: Try and solve broken if/else statements.
      /*
      'style/padding-line-between-statements': [
        'error',
        {blankLine: 'never', prev: 'if', next: 'block-like'},
      ],
      */
    },
  },
);
