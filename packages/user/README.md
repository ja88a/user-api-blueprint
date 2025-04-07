# TUBA Backend - Users WebService API

## Description

[Nest](https://github.com/nestjs/nest)-based tuba Backend Web Service dedicated to supporting users management.

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

Once locally started, you can access the WS service API from the URL [`http://localhost:3000/tuba-api/v1/users`](http://localhost:3000/tuba-api/v1/users)

### Production mode

```bash
# Build
$ pnpm build:prod

# Run in production mode
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
