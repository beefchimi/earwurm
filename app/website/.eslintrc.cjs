/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
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
};
