# TUBA Web Services' API Client

This package registry page is available on Github at [user-api-blueprint/pkgs/npm/tuba-api-client-aio](https://github.com/ja88a/user-api-blueprint/pkgs/npm/tuba-api-client-aio).

## Installation

Using a CLI command in your project root dir, execute one of the followings:

```sh
# npm
npm install @jabba01/tuba-api-client-aio@^x.y.z --save

# pnpm (or yarn)
pnpm add @jabba01/tuba-api-client-aio@^x.y.z
```

Or by inserting directly the dependency on your `package.json`:

```txt
    "@jabba01/tuba-api-client-aio": "^x.y.z",
```

## Usage

Key principle: Each set of APIs are grouped by business domain, each one has a different fetch client to be instantiated per the need.

Available API clients are located under `/apis`, while their data models, data transfer objects (DTO), are available under `/models`.

Sample instantiation of the user Roles API client:

```js
import { Configuration, UsersApi } from '@jabba01/tuba-api-client-aio'

/** General config, basically the target platform base URL */
export const clientConfig = new Configuration({
  basePath: 'https://tuba.none.com/tuba-api',
})

/** Roles API client instance */
const usersApiClient = new UsersApi(clientConfig)

/** Fetching of the service's health status */
const resp = await usersApiClient.getHealthUser().catch((err) => {
  const errResp = await err.response?.json()
  console.error(`Failed to get the Users service status \nResponse: ${errResp} \nError: ${err}`)
  exit(1)
})

console.log(`Users service status: ${resp.status}`)
```

You can refer to the Swagger web UI for the API endpoints and their respective data models at [/tuba-api](https://localhost:3000/tuba-api).

Integration samples of the TUBA API client:

- Local API E2E tests: [user-api-blueprint/test-e2e](https://github.com/ja88a/user-api-blueprint/tree/develop/test-e2e)
- TUBA client API at [user-api-blueprint/apps/tuba-api-client-aio](https://github.com/ja88a/TUBA-frontend/user-api-blueprint/tree/develop/apps/tuba-api-client-aio)

## Compatibility

This TypeScript/JavaScript client utilizes [Fetch API](https://fetch.spec.whatwg.org/) to interact with the TUBA Web Services' REST API.

This Node module can be used in the following environments:

Environment

- Node.js
- Webpack
- Browserify

Language level

- ES5 - you must have a Promises/A+ library installed
- ES6

Module system

- CommonJS
- ES6 module system

It can be used in both TypeScript and JavaScript. In TypeScript, the definition will be automatically resolved via `package.json`. ([Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html))

## Developing

### Building

To build and compile the typescript sources to javascript use:

```sh
pnpm i
pnpm run build
```

To build the final package distributed code, production mode:

```sh
pnpm run build:prod
```

### Updating from OpenAPI

The client is generated from the OpenAPI specification file `openapi.yaml` using the `openapi-generator-cli` tool.

To generate the client code from the all-in-one backend API, run the following command from the directory [`apps/tuba-server-aio`](../tuba-server-aio):

```sh
pnpm run apiclient:update
```

This will generate the client code and migrate it in this `apps/tuba-api-client` directory.

You might want to ensure the openapi build is correct & clean before migrating the client code:

```sh
pnpm run apiclient:build
```

Alternatively, to verify the openapi spec file using `rdme`, run:

```sh
pnpm run openapi:readme:validate
```

### Update & publish process of the TUBA API Client package

The tuba-api-client source files in `src/` are generated using the [openapi-generator](https://openapi-generator.tech/) tool: https://openapi-generator.tech/docs/generators/typescript-fetch/

1. have swagger specs documenting the controller / rest api code
2. generate the client code (scripted) -> tuba-api-client-aio/src
3. minimum of code postprocessing
4. classic npm package publication process

The npm script used to initiate the generation of the API Client sources (this package) are located in [tuba-server-aio](../tuba-server-aio/package.json): `pnpm run apiclient:update`

But the openapi-generator config is part of the web services' common config: [common/lib-utils-ws/src/api-configurator.ts](../../packages/common/lib-utils-ws/src/api-configurator.ts#L113)

The tuba-api-client update & publication process consists in the following steps:

```sh
# Build all modules
/ $ pnpm build

# Check the openapi spec file are correct & the client code is well generated -> Refer to the openapi-generator logs
apps/tuba-server-aio/ $ pnpm run apiclient:build

# Update & post-process the API client source files in `tuba-api-client-aio/src/`
apps/tuba-server-aio/ $ pnpm run apiclient:update

# Build & publish the package
apps/tuba-api-client-aio/ $ pnpm run publish:pack
```

### Publishing the package

#### Process

Requirement: user must be [logged in](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages) to the registry `npm.pkg.github.com`

Optional release steps, prior to the package publication process:

0. Ensure the package is properly built in `dist/` and the tests pass
1. Have all changes committed
2. git tag with the actual package version, e.g. `v0.1.4`

Package publication process:

1. build the package (`build`, `build:prod` miss the useful type files)
2. run `npm publish`
3. update the package version number to the new one you'll be working on from now on

Or use the npm script:

```sh
pnpm run publish:pkg
```

#### Versioning

Caution: the package build number is changed after it is published.
Meaning the version number you see in `package.json` is the one that will be published next, i.e. corresponding package is not published yet but in progress.

The script `publish:pkg` will perform a default _patch_ version update (+0.0.1) right after the package is published. This version number update is to be committed right after having published the package.

#### Dry Run

In order to test the package build locally, use the following command, equivalent to a `npm publish --dry-run`:

```sh
pnpm publish:pkg:dry
```

## Authors

Jabba 01 (ja88a @github)

[none.com](https://none.com)

[tuba.support@none.com](mailto:tuba.support@none.com)
