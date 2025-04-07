# TUBA Backend Doc - Setup

## How To

### Preparing a commit

Lint, format the code (prior to Husky precommit hook, cached):

```sh
pnpm precommit
```

Commit using commitizen, or git, or your IDE:

```sh
pnpm commit
```

### Updating the API Client

Ensure the swagger annotations are up-to-date:

```sh
pnpm build:force
```

Check for the build logs of openapitools-generator that there is no problem, nor definition orphans:

```sh
apps/tuba-server-aio $ pnpm apiclient:build
```

Update the `tuba-api-client-aio` package `src` folder:

```sh
apps/tuba-server-aio $ pnpm apiclient:update
```

Commit the changes of the tuba-api-client package with a release version note:

```sh
pnpm commit
```

Publish the tuba-api-client package:

```sh
apps/tuba-api-client-aio $ pnpm publish:pkg
```

Commit the change of the tuba-api-client package to prepare & reflect next version number.

```sh
pnpm commit
```

### Integrating DB schema changes - Migrations

Ensure the DB schema is up-to-date, local tests pass:

Local DB migration:

```sh
pnpm db:migrate:local
```

Remote DB migration, via Tailscale VPN:

```sh
./script/db-migrate_tailscale.sh
```
