
#########################################
##
## Base image
##
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update && apt-get install -y openssl curl dumb-init 
RUN apt-get upgrade -y && apt-get autoremove -y 
RUN apt-get clean

# Corepack w/ pnpm
RUN echo "npm version: $(npm --version)"
RUN echo "node version: $(node --version)"

RUN npm install -g corepack@latest
RUN echo "corepack version: $(corepack --version)"
RUN corepack enable
#RUN corepack prepare pnpm@9.15.4 --activate
RUN echo "pnpm version: $(pnpm --version)"

RUN pnpm config set store-dir /pnpm/store


#########################################
##
## Builder base image
##
FROM base AS base-build

# Install turbo
RUN npm install turbo --global
RUN turbo telemetry disable
RUN echo "turbo version: $(turbo --version)"


#########################################
##
## Prune projects
##
FROM base-build AS pruner

WORKDIR /usr/src/app
ARG PROJECT_PACKAGE

COPY . .
RUN turbo prune --scope=${PROJECT_PACKAGE} --docker


#########################################
##
## Production package dependencies
##
FROM base-build AS deps-def

WORKDIR /usr/src/app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /usr/src/app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /usr/src/app/out/json/ .

# Install all dependencies
ARG GITHUB_TOKEN
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile


#########################################
##
## Build the project
##
FROM deps-def AS build-assets

WORKDIR /usr/src/app
ARG PROJECT_PACKAGE

# Set the NODE_ENV environment variable
ENV NODE_ENV=production

# Copy source code of isolated subworkspace
COPY --from=pruner /usr/src/app/out/full/ .

# Build
RUN turbo build --filter=${PROJECT_PACKAGE}

# Clean up for prod
#RUN rm -rf ./**/*/node_modules
#RUN pnpm install --prod --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm prune --prod --no-optional
RUN rm -rf ./**/*/src ./**/*/test ./**/*/.turbo
RUN rm -rf ./**/*/.env*


#########################################
##
## Production image
##
FROM base AS tuba-server-prod

WORKDIR /app

ARG PROJECT_PACKAGE
ARG PROJECT_PATH
ARG PORT=3000

RUN adduser --group nodejs && adduser --ingroup nodejs --disabled-login --disabled-password --gecos "First Last,RoomNumber,WorkPhone,HomePhone" nodejs
USER nodejs

COPY --from=build-assets --chown=nodejs:nodejs /usr/src/app .

WORKDIR /app/${PROJECT_PATH}

ENV PORT=${PORT}
ENV NODE_ENV=production

LABEL Name=${PROJECT_PACKAGE}
EXPOSE ${PORT}

CMD [ "dumb-init", "node", "dist/main" ]
