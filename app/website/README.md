# Earwurm app

This repo hosts the website for the `earwurm` project.

## TsConfig

Originally, we isolated the `app` vs `node` configs. This had to be changed however because of the following bug: <https://github.com/antfu/eslint-config/issues/564>

As a result, the following packages were removed:

```json
{
  "@tsconfig/node20": "^20.1.4",
  "@vue/tsconfig": "^0.5.1"
}
```

### Record keeping

In case we ever restore the original `tsconfig`:

#### tsconfig.app.json

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"]
}
```

#### tsconfig.node.json

```json
{
  "extends": "@tsconfig/node20/tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "types": ["node"]
  },
  "include": ["lightningcss-plugins.ts", "vite.config.ts"]
}
```

#### tsconfig.json

```json
{
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.app.json" }
  ],
  "files": []
}
```
