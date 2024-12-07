import antfu from '@antfu/eslint-config';

// TODO: Figure out how to share this with the root `eslint.config.mjs`.
export default antfu(
  // Websites config
  {
    name: 'website',
    type: 'app',
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
    name: 'Websites general',
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
    },
  },
);
