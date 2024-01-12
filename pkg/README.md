# Package directory

All of the monorepo’s shared packages are located here. Most of these packages are “local only”, which means that we do not actually publish that folder’s code.

## TypeScript

If we later decide we want a unique `tsconfig.json` for each package, we will need to:

1. Create a `tsconfig.json` within each package folder.
2. Remove the `pkg` include within the root `tsconfig.json`.
3. Add the correct project `references` within the root `tsconfig.json`.

Individual package configs would look something like:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "module": "esnext",
    "moduleResolution": "bundler"
  },
  "include": ["vite.config.ts", "src/**/*.ts"]
}
```

A `references` value would look something like:

`"references": [{"path": "app/demo-create-vue"}]`
