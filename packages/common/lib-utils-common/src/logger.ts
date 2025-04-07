import { utilities as nestWinstonModuleUtilities } from 'nest-winston'
import { LoggerOptions, createLogger, format, transports } from 'winston'
import { IS_NODE_PROD } from './config-node'

/** Supported log levels */
const enum ELogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  default = INFO,
}

/** Set of constants specific to the logger's configuration */
const TIMESTAMP_PATTERN = 'YYYY-MM-DD HH:mm:ss.SSS'

/** Minimum level of log entries to be output */
const logsMinLevel = process.env.LOG_LEVEL || ELogLevel.default

/** Correlator ID generator */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const correlator = require('express-correlation-id')

/**
 * Default configuration for the logger in Production mode
 */
const winstonConfigProd: LoggerOptions = {
  level: logsMinLevel,
  exitOnError: true, // Default is `true` for not interfering
  format: format.combine(
    format((info) => {
      // eslint-disable-next-line no-param-reassign
      info.correlationId = correlator.getId()
      return info
    })(),
    format.timestamp({
      format: TIMESTAMP_PATTERN,
    }),
    format.splat(),
    format.errors({ stack: true }),
    format.json(),
  ),
  defaultMeta: { service: 'tuba-server-aio' },
  transports: [
    // Console JSON output
    new transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
}

/**
 * WinstonJS Logger integration in development mode
 *
 * Refer to [winstonjs/winston](https://github.com/winstonjs/winston)
 *
 * Integrates an automatic Daily File Rotation for local log files and a retention policy over time
 */
const winstonConfigDev: LoggerOptions = {
  level: logsMinLevel,
  exitOnError: true, // Default is `true` for not interfering
  format: format.combine(
    format((info) => {
      // eslint-disable-next-line no-param-reassign
      info.correlationId = correlator.getId()
      return info
    })(),
    format.timestamp({
      format: TIMESTAMP_PATTERN,
    }),
    format.splat(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [
    // Console output pretty formatted
    new transports.Console({
      format: format.combine(
        format.ms(),
        nestWinstonModuleUtilities.format.nestLike('Nest', {
          colors: !IS_NODE_PROD,
          prettyPrint: !IS_NODE_PROD,
        }),
      ),
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
}

/**
 * Winston Logger instance, to be used as the default nestjs logger module.
 *
 * If we detect running in a container / an ECS or k8s environment, the `NODE_ENV` env variable
 * must be set to `production` to output the console logs in a one line JSON format.
 */
export const logger = createLogger(
  IS_NODE_PROD ? winstonConfigProd : winstonConfigDev,
)
