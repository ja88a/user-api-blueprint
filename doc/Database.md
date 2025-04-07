# TUBA Backend Doc - Database

## Database tools

- [PostgreSQL](https://www.postgresql.org/docs/) RDBMS server
- [Drizzle](https://orm.drizzle.team/docs/overview) ORM, Kit & Studio: init the DB, manage migrations & ORM client connector client using PostgresJS
- npm scripts `db:*` when relevant
- [pgtools](https://www.npmjs.com/package/pgtools)

## Database modules

Each business domain defines its own DB. All databases can be hosted on the same database server, or not.

Each business domain defines its own drizzle-based DB connector, a database schema and own DB migration scripts. They all rely on the common database module [`dc-database-client`](../packages/dc-database-client/)

- user : [`dc-user-datastore`](../packages/user/database/)

Refer to `drizzle.config.ts` and the DB schema definition in `src/database/schema.ts`.

## Environment Variables

```txt
DATABASE_USER_NAME=tubadev
DATABASE_USER_PWD=test1234
DATABASE_ENDPOINT=localhost:5432
DATABASE_DB_NAME=tuba
```

The reported values are the defaults for a local development environment.

## Starting the DB Server

From the repo root, a local database server can be started, from the `docker-compose.yml` configuration:

```sh
pnpm db:start:local
```

It consists in a `docker compose up` and does also start a local Redis server for KV caching.

You can then either stop the containers using the command `docker compose stop` and drop all server instances using the command `docker compose down`.

The command `docker container ls` (or `stats`) enables checking for the status of the locally running containers.

## Initializing the Databases

First time your local database server is initiated, you need to create the databases and initialize their table schema.

From the repo root dir, having the postgres server running locally, execute:

```sh
pnpm db:init:local
```

This command will setup all the databases: create the DB instances (`db:create`) & initialize their table schema (`db:generate`).

Refer to the default DB user credentials, in dev mode, from `docker-compose.yml`, the npm script and/or the `.env.local` file. They should all be aligned.

If a database was already created, the `db:create` script fails. Either use the sub-project `packages/<domain>/dc-<domain>-datastore` where the same npm scripts are available, but then executed outside of the turbo-monorepo context, or use a postgreSQL client to execute whatever SQL command is required.

Refer to the `dc-<domain>-datastore/migrations/` .sql files where the necessary SQL requests should all be listed (generated through `db:generate`).

## Handling a DB migration

### Snapshot

To initialize a DB schema snapshot, generate it using the command:

```sh
pnpm db:generate:local
```

It consists in a `drizzle-kit generate`. It generates a customizable SQL migration file, in the sub dir `./migration` by default.

Only relevant SQL migration files should be committed. It is recommended to perform a `db:generate` only once the code and DB changes are done.

All SQL changes relative to a change of the DB tables shall be grouped into a single SQL migration file, having an explicit name.

A technique might consist in removing some of its previously generated local SQL migration files, generated during the development, and generating one new SQL migration file that will contain all related DB changes.

### Init or Migrate a DB schema

To migrate the table schema of an existing DB, or simply initializing a newly created DB, use the command:

```sh
pnpm db:migrate:local
```

It consists in a `drizzle-kit push`. It applies latest tables schema to the target DB.

You might have questions to answer on changes of existing tables to be properly handled.

Corresponding server access & user credentials must be present in `.env.local` at the monorepo dir level.

### Handling remote DBs

To migrate a remote database, e.g. dev/staging/prod PostgreSQL servers hosted on AWS, you need the followings:

- A VPN access (Tailscale actually) to reach the DB server - Cyril F. handles those access granting
- The user credentials of the remote DB

The user credentials are stored in a local _.env_ file at the root dir of the monorepo, e.g. `.env.dev`, `.env.staging` & `.env.prod`.

First you connect to the VPN network:

```sh
tailscale up --accept-routes --accept-dns --stateful-filtering
```

When a new domain database is introduced, it has to be created first, you can use this command, executed from the repo root directory or from a specific domain package:

```sh
pnpm db:create:dev
```

This one is for the Development platform, the staging & prod scripts are named: `db:create:staging` & `db:create:prod`.

When the database(s) exist, you can trigger the DB migration using the command:

```sh
pnpm db:migrate:dev
```

Either you use those 2 commands at a WS domain specific datastore level (`packages/<domain>/dc-<domain>-datastore`), or from the monorepo dir to batch the operations.

To ease the remote DB creation, snapshot & migration processes, you can use the all-in-one shell scripts:

```sh
./script/db-create_tailscale.sh
./script/db-migrate_tailscale.sh
./script/db-generate_tailscale.sh
```

Just check there the enabled target platform, expressed through corresponding npm script, e.g. `pnpm db:migrate:dev|staging|prod`.

## DB Explorer - Drizzle Studio

From any of the `dc-<domain>-datastore` package, you can start a local Postgres DB explorer, a Drizzle Studio instance:

```sh
# Local DB
pnpm db:studio:local

# Development DB
pnpm db:studio:dev
```

A Tailscale VPN connection is required to access remote DB servers.

You can use the `dc-<domain>-datastore` script:

```sh
./script/db-studio_tailscale.sh
```

You can access the Dizzle Studio WebUI from your web browser at URL [local.drizzle.studio](https://local.drizzle.studio).

## Connect to DB with `psql`

You can connect to the local DB using the `psql` CLI:

```sh
psql postgres://tubadev:test1234@localhost:5432/tuba-user
```

Using a remote DB, connect to Tailscale VPN, make sure your are granted to read/write on the target DB ([Entitle](https://entitle.io)), and use the following command:

```sh
psql "postgres://<user-name>:<user-pwd>@<host:port>/<db-name>"
```

In case of issue with your user password, use the JS function `encodeURIComponent(pwd)` for its safe usage in the postgres connection URL.

Performing a command on a DB, example:

```sh
psql -Atx postgresql://tubadev:test1234@localhost:5432/tuba-user -c 'select current_time'
```
