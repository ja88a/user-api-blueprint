# user-api-blueprint

Mono-repository for the development of backend components: Web Services API, data persistency layer, and common utility libraries.

## Purpose

The TUBA backend consists in exposed REST http/json API endpoints.
Corresponding API client is provided and maintained here.

All backend components are gathered here:

- the Web Services, exposing REST API endpoints or not
- WS common and shared packages / libraries, e.g. logger, eslint config..
- Data source providers: Database ORM client [& Data Caching connectors] towards 3rd party solutions
- WS API connectors: REST API client(s), connector for internal communications across services

A modular approach for developing each Web Service is adopted:

- Business domain design-based isolation of the scope, role and responsibilities of the Web services and their APIs
- Each Web Service can run independently: in its own Docker container, or as a serverless function

## Docs

### Tech docs

Refer to the following technical documentations for more info:

- Monorepo structure, tools & management: [doc/Monorepo](./doc/Monorepo.md)
- Integration and local run: [doc/Integrations](./doc/Integrations.md)
- Databases integration & management: [doc/Database](./doc/Database.md)
- Security related supports: [doc/Security](./doc/Security.md)

An OpenAPI Swagger UI is published by development platforms [tuba-api](http://localhost:3000/tuba-api).

## Setup

### Requirements

1. Have a [Node.js](https://nodejs.org/en/download/package-manager) npm & runtime locally installed.

   A LTS version >=20 is expected.

   Using Node Version Manager ([nvm](https://github.com/nvm-sh/nvm)) is recommended.

2. Have the node packages manager **pnpm** installed:

   ```sh
   npm i -g pnpm
   ```

3. Have a local [Docker](https://docs.docker.com/engine/install/) runtime if you want to run locally the database & caching servers, and/or the Web app server into containers.

### Repository initialization for local development

Install all the package dependencies and the Husky hook:

```sh
pnpm repo:init
```

All the apps & packages' dependencies will be downloaded and installed locally, including the development dependencies, i.e. dev tools.

This script consists mainly in a `pnpm install`.

There is a reset script available at the repo root level in case of having messed up with the node_modules, workspace package dependencies or the turbo caches:

```sh
pnpm clean
```

### Build

The first time this command is executed, or following a `pnpm clean`, all the workspace packages will be built.

Then only the node packages with changed files or package dependencies are rebuilt, thanks to the Turborepo local caching.

```sh
pnpm build
```

### Init & start the DB server

Init a new local PostgreSQL DB via Docker Compose:

```sh
pnpm db:init:local
```

The DB instance(s) are created and the DB schema is initialized.

The DB server is started via Docker Compose:

```sh
pnpm db:start:local
```

Stop the DB server:

```sh
pnpm docker:stop:local
```

### Run

A running database server must be available before running the Web Services.

Either use the Docker Compose command above, or run a local PostgreSQL server, or report a remote DB connection details in file `.env.local`.

Run locally the all-in-one server:

```sh
pnpm start
```

Run locally only the Users management Web Service:

```sh
pnpm start:user
```

Run the all-in-one server in a Docker container, via docker-compose:

```sh
pnpm docker:up:local
```

### Run Tests

Running tests against the Users management web service:

```sh
packages/user/ $ pnpm test
```

Note: The Database is mocked in this testing mode.

### Run E2E Tests

In order to run end-to-end tests, from the API Client against the locally running Users web service (and the database)

Ensure the DB is running using docker-compose: `pnpm db:start:local`.
And your app server is locally running using `pnpm start` or `pnpm start:user`.

Alternatively you can run all servers locally using Docker: `pnpm docker:up:local`.

You can then trigger the E2E tests, located in dir [`test-e2e`](./test-e2e/):

```sh
test-e2e/ $ pnpm test
```

### API Endpoint Specifications

When running the app server, or a single web service, with `NODE_ENV` not set to `production`, the OpenAPI Swagger UI is available under URI [/tuba-api](http://localhost:3000/tuba-api).

OpenAPI specifications are also available in the [`yaml`](http://localhost:3000/tuba-api-yaml) and [`json`](http://localhost:3000/tuba-api-json) formats.

The app server must be running to access the Swagger web UI.

### Exploring the DB

A locally running Drizzle Studio web UI is available for exploring the web service Database and managing its entries.

Command for running the DB explorer:

```sh
packages/user/ $ pnpm db:studio:local
```

Then locally navigate to [local.drizzle.studio](https://local.drizzle.studio) using your web browser.

## Tools

Monorepo handler: [Turborepo](https://turbo.build/)

[Node.js](https://nodejs.org): LTS version >= 20

[Nest.js](https://nestjs.com): LTS version >= 20

Node packages & workspace manager: [pnpm](https://pnpm.io/) v8+

Programming language: [Typescript](https://typescriptlang.org/)

Package versioning and changelogs: [Changesets](https://github.com/changesets/changesets)

OpenAPI spec & client generator: [OpenAPI Generator](https://openapi-generator.tech/)

[Drizzle](https://orm.drizzle.team/) ORM for the [PostgreSQL](https://www.postgresql.org/) DB

[Docker](https://docker.com) and its [Compose](https://docs.docker.com/compose/) for the DB server and the Web Services

## Authors

Jabba 01 (ja88a @github)
