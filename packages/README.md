# TUBA Backend - Packages

The business domains and libraries implementation for building Web Services and managing the dev framework.

## Web Services & Domains

- [`user`](./user/) : Users Management domain
  - Exposes a set of REST APIs: CRUD
  - Has a dedicated database
  - Handles entities: Users
  - Depends on domains: -

## Utilities

### Shared libraries

- [`common`](./common/) : Commonly shared utility libraries
  - [`dc-database-client`](./common/dc-database-client/) : The ORM connector to the RDBMS, consumed by most web services' data store. Package: `@jabba01/tuba-dc-database-client`
  - [`lib-utils-common`](./common/lib-utils-common/) : Tools available to any module, e.g. logger, config, shared data models. Package: `@jabba01/tuba-lib-utils-common`
  - [`lib-utils-data`](./common/lib-utils-data/) : Data models and related utilities available to any module, e.g. shared data models. Package: `@jabba01/tuba-lib-utils-data`
  - [`lib-utils-ws`](./common/lib-utils-ws/) : Web services' related tools, consumed by the `api` modules mostly, e.g. server config, security, shared http connection & I/O handlers. Package: `@jabba01/tuba-lib-utils-ws`

### Repository dev tools

- [`tools-repo`](./tools-repo/) : Shared packages' development tools & configurations
  - [`lib-config-eslint`](./tools-repo/lib-config-eslint/) : ESLint shared configs across the packages. Package: `@repo/eslint-config`
  - [`lib-config-typescript`](./tools-repo/lib-config-typescript/) : Typescript transpilation configs across the packages. Package: `@repo/lib-config-typescript`
