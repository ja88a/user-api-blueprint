# TUBA Backend - Monorepo Guide

General guidance on the available tools & techniques used for managing the TUBA backend monorepo.

## Workspaces

The workspace packages and apps are handled by pnpm.

Any new package created in either `packages/` or `apps/` is automatically integrated into the Turborepo task flows, as long as it matches the common package scripts such as `build`, `lint`, `format`, `changeset`, etc

pnpm doc:

- pnpm: [Workspace](https://pnpm.io/workspaces)
- pnpm: Continuous Integration using [Github Actions](https://pnpm.io/using-changesets#using-github-actions)

### Packages Structure and Naming Conventions

Respecting a rigorous directory structure and naming conventions is key for the long term maintenance of the mono-repository.

Following naming convention for the packages, mostly in `packages/`, is expected to apply at:

- the package directory name level, e.g. `type-name`
- the name of the package, e.g. `@jabba01/type-name`

Labels for _types_:

- `ws`: a [nestjs] web service, exposing a REST API and a having corresponding `client` (which stub are generated from the Swagger of corresponding WS REST API)
- `dc`: any data source connector/accessor which are shared with web services. They are bundled in a nestjs module. IT can consist in a DB connector, events source connector, a data cache handler
- `lib`: a library of utility classes, bundled as is, without a module integration

For the module main _name_ it should match with the business domain name, e.g. user, config, editor, order. The shorter the better, but it must be made clear and aligned with the shared terminology of the TUBA business domains.

We can use a business domain name to group of set of domain-related packages, e.g. `user`, `config`, etc.

Overall structure of the packages directory should look like:

```txt
apps/
   tuba-server-aio                     public - The all-in-one monolithic Web App Server
   tuba-api-client-aio                 public - The all-in-one client of exposed Web Services
packages/
   lib-config-what                     internal - Share config utility library
   lib-utils-scope                     internal - Shared utility library
   dc-database-client                  internal - Common database access client/connector
   dc-caching-client                   internal - Common data caching client
   business-domain/
```

That makes lots of sub-projects & packages, and then package dependencies. Use `workspace:` ([doc](https://pnpm.io/workspaces#referencing-workspace-packages-through-their-relative-path)) to declare those dependencies in your `package.json` file.
Else Turborepo will handle the necessary [automated with `dev`] rebuilds once you will have set up the linking between the packages. Refer to corresponding config file `turbo.json`.

The ultimate aim is modularity, reusability and extensibility. Be very cautious about the dependencies you create among the Web Services. Only the packages with role `api`, `data` or `client` should be imported by other WebServices.

Think that each developed Web Service, representing a specific business domain, should be runnable autonomously in the form of a standalone micro-service, e.g. on a Kubernetes runtime platform, or as a serverless function (following a minimal extension work).

One of the key principle to achieve is the loose coupling of the Web Services. Their communication interface for interactions among internal/business domain Web Services is to be extracted in the `intercon` module, to first consist in a limited module dependency (a limited export of a module controller main methods) but later on in remote calls. Integrating a gRPC API is indeed considered, for independency towards remotely deployed Web Services and optimal communications, rather than a REST API http/json request-response interaction scheme.

### Introducing a new package

In the directory `apps/` we want only a few autonomously runnable and distributable packages, the ones that are externally distributed. They should merely consist in a composition of the different node packages or common libraries reported in `packages/`.

To introduce a new package, you can reuse one of the existing type of package (nestjs-based web service or module, connector, library, client) to replicate/copy it into a newly created sub-directory, within the directory `packages/` or `apps/`.

Or creating a new nestjs module or app from scratch in `packages/`:

```sh
repo-root/ $ npx nest new --directory ./packages[/biz-domain]/package-name -g -s -p pnpm --dry-run
```

Refer to the section [Package naming conventions](#packages-structure-and-naming-conventions) for expressing the _package-name_.

Then adapt the newly created package `package.json` (package name, script names, dev dependencies for tsconfig/eslint), the `.eslintrc.js` & `tsconfig.json` and the package's `turbo` integration.

Newly created packages in `packages/` and `apps/` are automatically integrated into the pnpm workspace.

## Turborepo

The Turborepo solution is used for managing the development of the set of packages in this repository.

Turborepo doc:

- Core concepts: [Monorepos](https://turbo.build/repo/docs/core-concepts/monorepos)
- Using Turborepo with GitHub Actions: [CI](https://turbo.build/repo/docs/ci/github-actions)

### Setup

Turborepo is a dev dependency of your root repository package.

It is installed locally once having `pnpm install` your node modules.

Check for the turbo CLI command options:

```sh
npx turbo --help
```

Telemetry related commands:

```sh
npx turbo telemetry status
npx turbo telemetry disable
```

### Apps and Packages

- `@repo/eslint-config`: `eslint` configurations (includes `lib-config-eslint-next` and `eslint-config-prettier`)
- `@repo/lib-config-typescript`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some tools setup:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command from the repo root directory:

```sh
pnpm build
```

### Troubleshoot

Get a status about the turbo daemon:

```sh
npx turbo daemon status
```

Stop the turbo daemon and removes any stale daemon state:

```sh
pnpm turbo:stop
```

If you doubt that Turborepo does correctly its job, you can bypass the caches by running this command from the repo root directory:

```sh
npx turbo build --force
```

You can always reset your local mono-repo and its sub-projects using the command:

```sh
pnpm clean
```

This will remove the `node_modules/`, `dist/` and `.turbo` directories. Next action might consist in:

```sh
pnpm i && pnpm build
```

### Develop in Watch mode

To develop individual apps and packages, run the following command in each necessary sub-project:

```sh
pnpm watch
```

However using previous `pnpm build` or `pnpm build:tsc` at the repo root dir level is recommended since it ensures all dependent packages get updated, and only those.

An alternative solution is to watch file changes and recompile automatically using Turborepo:

From the repo root directory, starting watching for all changes:

```sh
pnpm watch
```

That command triggers many watcher processes running in parallel and can exhaust your machine.

The benefit of `pnpm build:tsc` against a `pnpm build` is that it doesn't delete the `/dist` files and so avoid breaking your workspace dependency imports in the IDE. However it is less clean since removed/renamed files might remain while they will be removed on a fresh build.

You can narrow down the scope/number of watchers using the following command:

```sh
npx turbo watch build:tsc --concurrency 20 --filter @jabba01/tuba-ws-market-api --continue
```

Then only the dependencies of the target project/package, the Market WS here, are watched.

## Husky Hooks

Refer to the active Husky hooks available in [`.husky/`](../.husky/)

- `commit-msg`: validation of commit messages to be semver compliant
- `pre-commit`: linting, formatting & build of the code repo

Prior to pushing any commit, the command `pnpm precommit` is triggered. This task will not break in case of file code rewriting, but if the linting or build fail.
You might want to execute that command prior to a successful commit, to ensure your commit embeds all expected code formatting, without requiring another commit.

## Publishing

### Changesets

The [Changesets](https://github.com/changesets/changesets) tool is used for managing the versioning and change logs of the monorepo packages.

Default config: [.changeset/config.json](../.changeset/config.json)

Changeset documentations:

- README: [Information about using changesets](../.changeset/README.md)
- pnpm: [Using Changesets with pnpm](https://pnpm.io/using-changesets)
- pnpm: [Using Github Actions](https://pnpm.io/using-changesets#using-github-actions)
- changesets docs: [Common Questions](https://github.com/changesets/changesets/blob/main/docs/common-questions.md)

### Changesets Instructions

#### Adding new changesets

run the following at the root of the repository:

```sh
pnpm changeset
```

The generated markdown files in the `.changeset/` directory should be committed to the repository.

#### Releasing changes

This is expected to be handled as a CI Github Action.

1. bump the versions of the packages previously specified with pnpm changeset (and any dependents of those) and update the changelog files

   ```sh
   pnpm version-packages
   ```

2. Update the lockfile, and rebuild packages

   ```sh
   pnpm install
   ```

3. Commit the changes

4. Publish / release

   ```sh
   pnpm release
   ```
