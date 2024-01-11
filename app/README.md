# App directory

Add context...

## Eslint

At the moment, we are allowing each `app` to manager their own `eslint` config. We may later decide to move this to the root level `.eslintrc`. If so, we should be able to clearly specify `Vue` config like so:

```json
"overrides": [
  {
    "files": "*.vue",
    "parser": "vue-eslint-parser",
    "extends": [
      "plugin:vue/vue3-essential",
      "eslint:recommended",
      "@vue/eslint-config-typescript",
      "@vue/eslint-config-prettier/skip-formatting",
    ],
    "plugins": [],
    "rules": {}
  }
],
```
