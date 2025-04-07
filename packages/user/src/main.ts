import { logger as loggerApp } from '@jabba01/tuba-lib-utils-common'
import {
  WS_CONFIG,
  setupHttpLogger,
  setupWebServiceAPI,
} from '@jabba01/tuba-lib-utils-ws'
import { NestFactory } from '@nestjs/core'
import { WinstonModule } from 'nest-winston'
import { exit } from 'node:process'
import { UserModule } from './rest-api/user.module'

async function bootstrap(): Promise<void> {
  const nestApp = await NestFactory.create(UserModule, {
    // Bind the NestJS logs to the app logger
    logger: WinstonModule.createLogger({
      instance: loggerApp,
    }),
  })

  // Fully setup the WebService and its REST APIs
  await setupWebServiceAPI(nestApp)

  // Log any API HTTP requests & responses
  setupHttpLogger(nestApp, loggerApp)

  // Enable shutdown hooks for listening to system events
  nestApp.enableShutdownHooks()

  // Start the web service
  const wsPort = process.env.PORT || WS_CONFIG.WS_API_PORT_DEFAULT
  await nestApp
    .listen(wsPort)
    .then(() => {
      if (process.env.OPENAPI_CLIENT_GENERATOR === 'true') {
        loggerApp.warn(`API client stubs generated - Exiting`)
        exit()
      } else loggerApp.warn(`Web Service 'TUBA Users' listens on port ${wsPort}`)
    })
    .catch((err) => {
      throw new Error(
        `Failed to start the web service 'TUBA Users' \n${err.stack ?? err}`,
      )
    })
}

bootstrap().catch((err) => {
  loggerApp.error(
    `Failed to bootstrap web service 'TUBA Users' \n${err.stack ?? err}`,
  )
  process.exit(1)
})
