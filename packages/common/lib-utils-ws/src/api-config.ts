/**
 * Common set of settings relating to the Microservice configuration
 */
export const WS_CONFIG = {
  /**
   * The URI prefix behind which all HTTP API are exposed
   */
  URI_DOMAIN_API: process.env.API_URI_PREFIX || 'tuba-api',

  /**
   * Actual URI version number(s) this microservice's controller supports
   * It can consists in an array, e.g. `['1', '2']` or be `VERSION_NEUTRAL`.
   * Refer to {@link https://docs.nestjs.com/techniques/versioning}
   */
  VERSION_PUBLIC: process.env.API_VERSION_NUMBER || '1',

  /**
   * Default WebService port for exposing a REST API.
   *
   * The public port number the Nodejs app exposes, where the controller API is accessible from
   */
  WS_API_PORT_DEFAULT: process.env.API_PORT || 3000,

  /**
   * gRPC port for exposing a gRPC API from Notification service.
   *
   * The public port number the Nodejs app exposes, where the Notification gRPC API is accessible from
   */
  GRPC_PORT_NOTIFICATION: process.env.GRPC_PORT_NOTIFICATION || 5001,
}

export const WS_TOOLS_CONFIG = {
  OPENAPI_ENABLED: (process.env.OPENAPI_ENABLED || 'false') === 'true',

  OPENAPI_CLIENT_GENERATOR:
    (process.env.OPENAPI_CLIENT_GENERATOR || 'false') === 'true',

  OPENAPI_CLIENT_OUTDIR: process.env.OPENAPI_CLIENT_OUTDIR || './dist/',
}

/**
 * Application specific name for the correlation ID,
 * optionally specified in the header of http requests
 */
export const correlationIdHeader = 'x-correlation-id'
