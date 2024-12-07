import antfu from '@antfu/eslint-config';

// References:
// 1. https://github.com/antfu/eslint-config
// 2. https://github.com/antfu/eslint-plugin-antfu
// 3. https://github.com/antfu/eslint-plugin-format
export default antfu(
  // Packages config
  {
    name: 'Packages',
    type: 'lib',
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

  // TODO: Is there not a way to have a separate entry for `/websites`?

  // General config
  {
    // Without a `files` scope, these rules will apply to everything.
    name: 'Packages general',
    rules: {
      // General
      'no-console': 'warn',

      // Antfu
      'antfu/if-newline': 'off',
      'style/arrow-parens': ['error', 'always'],
      'style/object-curly-spacing': ['error', 'never'],
      'test/prefer-lowercase-title': 'off',
      'ts/explicit-function-return-type': 'off',
      'ts/strict-boolean-expressions': 'off',

      // I like sorted imports/exports... but the Antfu config doesn't
      // quite order things the way I'd like, so I'm disabling it for now.
      'perfectionist/sort-exports': 'off',
      'perfectionist/sort-named-exports': 'off',
      'perfectionist/sort-imports': 'off',

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
