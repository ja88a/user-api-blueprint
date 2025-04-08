import helmet from 'helmet'
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common'

import { OpenApiNestFactory } from 'nest-openapi-tools'
import { DocumentBuilder } from '@nestjs/swagger'
import { WS_CONFIG, WS_TOOLS_CONFIG, correlationIdHeader } from './api-config'

import winston from 'winston'
import { logger as loggerExpress, LoggerOptions } from 'express-winston'
import { IS_ENV_PROD, IS_NODE_PROD, logger } from '@jabba01/tuba-lib-utils-common'
import { json } from 'express'
import cookieParser from 'cookie-parser'
import { BadRequestException } from './exceptions/bad-request.exception'

/** Whitelisted domains for CORS */
const whitelistedUrls = [
  /^https?:\/\/localhost(:\d+)?$/, // local
  /\.dev\.none\.com$/, // dev
  /\.stg\.none\.com$/, // staging
  /\.api\.none\.com$/, // prod
]

/**
 * Secures the NestJS application security
 * @param app the NestJS application to enforce in terms of security
 */
function handleApiSecurity(app: INestApplication): void {
  // Middleware for setting up HTTP security headers
  app.use(helmet())

  // Enable CORS for all requests
  app.enableCors({
    origin: whitelistedUrls,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  })

  // Cookie parser middleware (used for JWT-based auth)
  app.use(cookieParser())

  // Fine tuning of accepted requests' payload size
  app.use('/kyc', json({ limit: '10mb' }))
  app.use(json({ limit: '100kb' }))
}

/**
 * Publish the OpenAPI documentation, generate a spec file and/or client stubs
 * @param app the target NestJS application
 */
async function handleOpenAPI(app: INestApplication): Promise<void> {
  if (WS_TOOLS_CONFIG.OPENAPI_ENABLED && !IS_ENV_PROD) {
    return await OpenApiNestFactory.configure(
      app,
      new DocumentBuilder()
        .setTitle('TUBA API')
        .setDescription('TUBA by Jabba ø1 - OpenAPI')
        .setVersion(WS_CONFIG.VERSION_PUBLIC + '.0')
        .setContact(
          'Jabba ø1 (@ja88a)',
          'https://srenault.com',
          'tuba.support@none.com',
        )
        .setExternalDoc('TUBA Documentation', 'https://docs.none.com/')
        .addServer('http://localhost:3000/' + WS_CONFIG.URI_DOMAIN_API, 'local dev')
        .addServer('https://dev.none.com/' + WS_CONFIG.URI_DOMAIN_API, 'development')
        .addBearerAuth({
          description: 'JWT token to access APIs requiring authentication',
          type: 'http',
          name: 'Authorization',
          scheme: 'bearer',
        })
        .addCookieAuth(
          'access_token',
          {
            description: 'JWT token to access APIs requiring authentication',
            type: 'apiKey',
            in: 'cookie',
            name: 'access_token',
          },
          'cookieAuth',
        )
        .addGlobalParameters({
          in: 'header',
          required: false,
          name: correlationIdHeader,
          schema: {
            example: 'a5e8ee1b-5fe9-4bea-82fa-e694ed36b9bb',
          },
        }),
      {
        webServerOptions: {
          enabled: true,
          path: WS_CONFIG.URI_DOMAIN_API,
        },
        fileGeneratorOptions: {
          enabled: WS_TOOLS_CONFIG.OPENAPI_CLIENT_GENERATOR && !IS_NODE_PROD,
          outputFilePath:
            WS_TOOLS_CONFIG.OPENAPI_CLIENT_OUTDIR + 'tuba-openapi.yaml', // or .json
        },
        clientGeneratorOptions: {
          enabled: WS_TOOLS_CONFIG.OPENAPI_CLIENT_GENERATOR && !IS_NODE_PROD,
          type: 'typescript-fetch',
          outputFolderPath:
            WS_TOOLS_CONFIG.OPENAPI_CLIENT_OUTDIR +
            '/' +
            WS_CONFIG.URI_DOMAIN_API +
            '-client',
          additionalProperties:
            'supportsES6=true,typescriptThreePlus=true,' +
            'npmName=@jabba01/tuba-marketplace-api-client,npmVersion=0.1.0,npmRepository=https://github.com/ja88a/user-api-blueprint.git,' +
            'apiPackage=apis,modelPackage=models,withSeparateModelsAndApi=true,',
          openApiFilePath:
            WS_TOOLS_CONFIG.OPENAPI_CLIENT_OUTDIR + 'tuba-openapi.yaml',
          skipValidation: true, // false by default
        },
      },
      // Swagger Options
      {
        operationIdFactory: (c: string, method: string) => method,
        ignoreGlobalPrefix: true,
        deepScanRoutes: true,
        // customfavIcon: '<path>/favicon.png', //adding our favicon to swagger
        // customSiteTitle: 'stacksuit-web-api Docs', //add site title to swagger for nice SEO
        // customCss: `
        //   .topbar-wrapper img {content:url(\'path-to-images/image.png\'); width:200px; height:auto;}
        //   .swagger-ui .topbar { background-color: #f1f2f1; } `,
        // swaggerOptions: {
        //   persistAuthorization: true, // this helps to retain the token even after refreshing the (swagger UI web page)
        //   // swaggerOptions: { defaultModelsExpandDepth: -1 } //uncomment this line to stop seeing the schema on swagger ui
        // }
      },
    ).catch((err) => {
      logger.error(`Failed to init OpenAPI tools \n${err.stack ? err.stack : err}`)
    })
  }
}

/**
 * Enable the URI-based versioning of APIs
 * @param app the target NestJS application
 */
function handleApiVersioning(app: INestApplication): void {
  // Prefix all URIs of this service's HTTP REST API
  app.setGlobalPrefix(WS_CONFIG.URI_DOMAIN_API)

  // Enable the URI-based versioning of APIs
  app.enableVersioning({
    type: VersioningType.URI,
  })
}

/**
 * Configuration options for logging at the Expressjs HTTP MiddleWare level
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getHttpLoggerConfig = (logger: winston.Logger): LoggerOptions => {
  const wsRootUri = '/' + WS_CONFIG.URI_DOMAIN_API + '/v' + WS_CONFIG.VERSION_PUBLIC
  return {
    winstonInstance: logger,
    msg: 'HTTP {{res.statusCode}} {{req.method}} {{req.url}} ({{res.responseTime}}ms)',
    statusLevels: { error: 'error', warn: 'warn', success: 'info' },
    ignoredRoutes: [
      '/',
      '/favicon.ico',
      '/' + WS_CONFIG.URI_DOMAIN_API,
      '/' + WS_CONFIG.URI_DOMAIN_API + '/health',
      wsRootUri + '/auth/health',
      wsRootUri + '/auth/signup',
      wsRootUri + '/auth/signin',
      wsRootUri + '/asset/health',
      wsRootUri + '/crm/health',
      wsRootUri + '/market/health',
      wsRootUri + '/notification/health',
      wsRootUri + '/role/health',
      wsRootUri + '/sale/health',
      wsRootUri + '/tokenizer/health',
      wsRootUri + '/user/health',
    ],
    requestWhitelist: ['method', 'url', 'query', 'body'], // headers, httpVersion
    responseWhitelist: ['statusCode', 'body'],
  }
}

/**
 * Enable the support for a correlationID middleware for tracking http requests
 * Logging at the Expressjs HTTP middleware level
 * @param app the target NestJS application instance
 * @param loggerApp the Winston logger instance to use for logging http i/o
 */
export const setupHttpLogger = (
  app: INestApplication,
  loggerApp: winston.Logger,
): INestApplication => {
  const httpLoggerConfig = getHttpLoggerConfig(loggerApp)
  const correlator = require('express-correlation-id')
  app.use(
    loggerExpress(httpLoggerConfig),
    correlator({ header: correlationIdHeader }),
  )
  return app
}

/**
 * Setup the REST APIs of a nestjs WebService, prior to its launch
 *
 * Handle the versioning, the security of the APIs as well as the OpenAPI tooling, if enabled
 *
 * @param app the target NestJS application instance
 */
export const setupWebServiceAPI = async (app: INestApplication): Promise<void> => {
  // APIs versioning
  handleApiVersioning(app)

  // Protect the exposed endpoints
  handleApiSecurity(app)

  // Input DTO validation pipes
  handleValidationPipe(app)

  // Handle the Swagger doc & OpenAPI generations
  await handleOpenAPI(app)
}

/**
 * Enable validation pipes for the i/o DTOs
 * @param app
 */
export const handleValidationPipe = (nestApp: INestApplication): void => {
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,

      exceptionFactory: (errors) =>
        BadRequestException.INVALID_INPUT(
          `Invalid request submitted - Fields validation failed: ${errors.map((error) => error.constraints).filter((c) => c !== undefined)}`,
          errors,
        ),
    }),
  )
}
