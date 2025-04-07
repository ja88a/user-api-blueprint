# TUBA Backend Doc - Integrations & Run

## Docker integration

The repo main [Dockerfile](../Dockerfile) enables building production images of either the all-in-one TUBA backend server or of a single micro Web service.

It is multi-layered, relies on `pnpm`, `nestjs/tsc` & `Turborepo` mostly to build, in addition to `nodejs`.

### Docker Build Environment Variables

```txt
VARIABLE            DESCRIPTION                         SAMPLE VALUE
-----------------------------------------------------------------------------------------
DOCKER_IMG_NAME     Docker image name                   tuba-domain-api
DOCKER_IMG_TAG      Docker image tag / version number   latest, 0.1.0
PORT                Docker image exposed port           3000, 8080
PROJECT_PACKAGE     Name of the target package          @jabba01/tuba-ws-domain-api
PROJECT_PATH        Path from where to start the module packages/domain/ws-domain-api
```

Caution: The environment variable `GITHUB_TOKEN` must be set with an authorized Github PAT for private access to the npm registry.

Only the variable `PORT` specification is made optional, its default value is `3000` (refer to the Dockerfile layer _cts-server-prod_).

### Build CLI

Generic CI execution script:

```sh
docker build -t ${DOCKER_IMG_NAME}:${DOCKER_IMG_TAG} --build-arg PROJECT_PACKAGE=${PROJECT_PACKAGE} --build-arg PROJECT_PATH=${PROJECT_PATH} --build-arg PORT=${PORT} .
```

The above is reported in the npm script `docker:build:ci` available in the repo root [package.json](../package.json).

### Sample Docker build commands for CI

Sample usage of the `docker:build:ci` script for building the Docker image of `tuba-server-aio`, a monolithic app server part of `apps/`:

```sh
DOCKER_IMG_NAME=tuba-server-aio DOCKER_IMG_TAG=0.1.0 PROJECT_PACKAGE=@jabba01/tuba-server-aio PROJECT_PATH=apps/tuba-server-aio PORT=3000 pnpm docker:build:ci
```

Sample usage of the `docker:build:ci` script for building the Docker image of `tuba-ws-user-api`, a micro service part of `packages/`:

```sh
DOCKER_IMG_NAME=tuba-ws-user-api DOCKER_IMG_TAG=0.1.0 PROJECT_PACKAGE=@jabba01/tuba-ws-user-api PROJECT_PATH=packages/user/ws-user-api PORT=3000 pnpm docker:build:ci
```

## Web Services Runtime

### TUBA Runtime Environment Variables

#### Mandatory Runtime Environment Variables

```txt
VARIABLE            DESCRIPTION                         SAMPLE VALUE
---------------------------------------------------------------------------------------------------
DATABASE_USER_NAME  Databases user name                 tuba_db_worker
DATABASE_USER_PWD   Database user password              thats_secret
DATABASE_ENDPOINT   DB server endpoint host:port        localhost:5432
DATABASE_DB_NAME    Default DB name                     tuba, tuba-user
```

Those variables hold sensitive values and must be protected.

#### Optional Runtime Environment Variables

```txt
VARIABLE            DESCRIPTION                         DEFAULT     SAMPLE VALUE
---------------------------------------------------------------------------------------
ENVIRONMENT         General execution context           prod-testnet prod-mainnet
NODE_ENV            Nodejs exec environment/mode        production  dev
API_PORT            Port of Nodejs exposed REST API     3000        8080
API_URI_PREFIX      URI prefix / domain for APIs        tuba-api    api
API_VERSION_NUMBER  Version number of the WS APIs       1           2, 3
LOG_LEVEL           Minimum level for logs output       info        warn, error
OPENAPI_ENABLED     Publish or not the OpenAPI web doc  false       true
```

Actual env variable `PORT` prevails on a set `API_PORT` runtime env variable, if specified.
However `API_PORT` should be used instead of `PORT`, the latter is deprecated (2024-05).

Runtime env variable **ENVIRONMENT** = {execMode}-{chainMode}

- _execMode_ - Supported execution modes: `dev` or `prod`
- _chainMode_ - Supported blockchain network types: `testnet` or `mainnet`

### Local Docker run

If you specify the `PORT`, make sure it is aligned with the Docker image exposed port, set when built.

Sample command to run a docker container:

```sh
docker run -i --rm --env NODE_ENV=dev,DATABASE_USER_NAME=tubadev,DATABASE_USER_PWD=test1234,DATABASE_ENDPOINT=localhost:5432,DATABASE_DB_NAME=users,ADMIN_PASSWORD=test1234,JWT_SECRET=test1234,REDIS_ENDPOINT=localhost:6379,REDIS_PASSWORD=hSy2TiQFw8Yyzs4oxqjzwvoM --name tuba-ws-user-api tuba-ws-user-api:0.1.0
```

Sample run command of a docker container using a local `.env` file:

```sh
docker run -i --rm --env-file .env.prod --name tuba-server-aio-dev tuba-server-aio:latest
```

```sh
docker run -i --rm --env-file .env.local --name tuba-ws-user-api tuba-ws-user-api:0.1.0
```

### Web Services Health Check

HTTP Get requests for checking the health of web services are exposed as public API.

The full response model is available in [lib-utils-ws/dto/health.dto](../packages/lib-utils-ws/src/dto/health.dto.ts), below is the general model:

```js
{
  name?: string
  status: string // ok, warn, error
  info?: string
  version?: string
  services?: [{
    name: string
    status: string
    info?: string
  }]
}
```

Refer to the OpenAPI Swagger doc for more details on fields & values.

The minimum expected response is an HTTP `200` response with the payload:

```json
{ "status": "ok" }
```

Checking for the server all-in-one status:

```txt
GET /tuba-api/health
```

Checking for a given web service domain status:

```txt
GET /tuba-api/v1/users/health
```
