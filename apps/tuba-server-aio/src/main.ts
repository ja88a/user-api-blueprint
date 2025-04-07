import { NestFactory } from '@nestjs/core'
import { logger as loggerApp } from '@jabba01/tuba-lib-utils-common'

import {
  WS_CONFIG,
  setupHttpLogger,
  setupWebServiceAPI,
} from '@jabba01/tuba-lib-utils-ws'
import { WinstonModule } from 'nest-winston'
import { exit } from 'node:process'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const nestApp = await NestFactory.create(AppModule, {
    // Bind the NestJS logs to the app logger
    logger: WinstonModule.createLogger({
      instance: loggerApp,
    }),
    abortOnError: false,
  })

  // Fully setup the WebService and its REST APIs
  await setupWebServiceAPI(nestApp)

  // Log any API HTTP requests & responses
  setupHttpLogger(nestApp, loggerApp)

  // Enable shutdown hooks for listening to system events
  nestApp.enableShutdownHooks()

  // Start the app server
  const wsPort = process.env.PORT || WS_CONFIG.WS_API_PORT_DEFAULT
  await nestApp
    .listen(wsPort)
    .then(() => {
      if (process.env.OPENAPI_CLIENT_GENERATOR === 'true') {
        loggerApp.warn(`API Client generated - Exiting`)
        exit()
      } else loggerApp.warn(`TUBA Web Services listen on port ${wsPort}`)
    })
    .catch((err) => {
      throw new Error(
        `Failed to start the all-in-one app server \n${err.stack ?? err}`,
      )
    })
}

bootstrap().catch((err) => {
  loggerApp.error(
    `Failed to bootstrap tuba-server-aio \n${err.stack ?? err}`,
  )
  process.exit(1)
})
