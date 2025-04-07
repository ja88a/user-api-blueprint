# TUBA Backend Server - All-in-One

## Description

This [Nest](https://github.com/nestjs/nest) framework gathers a chosen set of Web Services to be deployed in a monolithic form.

This is an integration of individual micro-services with some tooling. There is no business logic in this module, but tech one.

## Installation

```bash
pnpm install
```

## Running the app

### Development mode

```bash
# development
$ pnpm start

# watch mode
$ pnpm watch:start

# production mode
$ pnpm start:prod
```

### Production mode

```bash
# watch mode
$ pnpm build:prod

# production mode
$ pnpm start:prod
```

## Test

```bash
# unit tests
$ pnpm test

# e2e tests
$ pnpm test:e2e

# test coverage
$ pnpm test:cov
```

## OpenAPI Doc

An online Swagger-based web documentation of available Web Services' APIs can be enabled.

Caution: Publishing the API web doc should not be enabled in production mode, but on dedicated platform.

Start the backend web services along with a web doc:

```sh
pnpm start:openapi
```

Then the web documentation is available under the URI `/tuba-api`, e.g. [`http://localhost:3000/tuba-api`](http://localhost:3000/tuba-api)

## API Client Generation

A solution for automatically generating an Axios/Typescript-based client for the published APIs (the ones listed in the Swagger doc) is implemented from [BeerMoneyDev/nest-openapi-tools](https://github.com/BeerMoneyDev/nest-openapi-tools).

Caution: This process is not intended to be ran in production, but in a dev setup only.

To initiate the API client code generation, the requirements are:

- Having a local Java Runtime Environment available
- Not having `NODE_ENV` set to `production`
- Having the dev dependencies installed

Generate the API client stubs:

```sh
pnpm build:apiclient
```

Corresponding artifacts are generated in `dist/tuba-api-client`.
