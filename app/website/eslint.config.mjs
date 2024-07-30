import antfu from '@antfu/eslint-config';

// TODO: Figure out how to share this with the root `eslint.config.mjs`.
export default antfu(
  // Websites config
  {
    type: 'app',
    // ignores: [],
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
    },
    vue: {
      overrides: {
        'vue/define-macros-order': 'off',
        'vue/html-self-closing': ['error', {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        }],
        'vue/object-curly-spacing': ['error', 'never'],
      },
    },
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
