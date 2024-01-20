# Contributing

> Come one, come all! Your help is needed in making `Earwurm` better than it has any right to be!

First of all, thank you. Second of all, [issues can be found here](https://github.com/beefchimi/earwurm/issues).

## Getting started

1. Clone repo.
2. Install dependencies _(must use `pnpm`)_.
3. Get coding!

**Cloning the repo:**

```sh
# Over HTTPS
git clone https://github.com/beefchimi/earwurm.git

# Over SSH
git clone git@github.com:beefchimi/earwurm.git

# Using the CLI
gh repo clone beefchimi/earwurm

# Once cloned, change into the directory
cd earwurm
```

**Installing project dependencies:**

```sh
# PNPM is our package manager of choice and must be used!
pnpm i
```

**Get coding:**

```sh
# Simply run the `start` command from the project root
pnpm start
```

For a list of all the available commands, please see the root `package.json`. Overall, commands are kept simple, so there shouldn't be any surprises. Typically, the commands you are going to use are:

- `build` will build all packages and apps.
- `start` will build and watch any relevant `pkg` folders, and build and fire up development servers for all `app` folders.
  - All `localhost` addresses for running apps will be printed to your terminal when you run `start`.
- `lint` checks the codebase for `eslint` errors, but does not fix them.
- `lint:fix` automatically fixes any `eslint` errors that can be programatically resolved.
- `format` checks the codebase for `prettier` errors, but does not fix them.
- `format:fix` automatically fixes any `prettier` errors that can be programatically resolved.
- `type-check` checks the codebase for any TypeScript errors, but does not fix them.
- `test` fires up the `vitest` server and runs all `*.test.ts` files.
- `clean` will delete any `dist` and `coverage` folders.
- `nuke` will run `clean` along with blowing away all `node_modules` and pruning unused `pnpm` packages.

If you want to run commands from specific apps/packages, you can use `pnpm --filter app-or-package-name command-name`... but honestly, you should be able to do everything you need to from the root using only the commands found in the root `package.json`.

## Earwurm

The primary package produced by this monorepo is `earwurm`, located within the `~/pkg/earwurm` directory.

### Pull requests

Once you have submitted a PR and it is ready for review:

1. Run the `pnpm report` command and respond to the prompts.
   - Declare the “change impact” _(is this a major/minor/patch change)_.
   - Provide a `CHANGELOG` message.
2. Once finished, add the generated `*.md` file and commit it / push to your branch.

### Publishing

Publishing is handled automatically by the `@changesets` package. This package, in concert with Changesets Bot and `release.yml` GitHub workflow, allows us to publish `earwurm` whenever the `main` branch sees a `package.json > version` value change.

## App

To aid in local development, I have provided a demo application. This app doubles as our “marketing site”, which is also built-and-deployed through GitHub.

### Development

Simply run the `start` command from the project root and you will get file watching for `pkg/earwurm` as well as HMR for the app. Any changes you make to `earwurm` are automatically available to the demo app.
