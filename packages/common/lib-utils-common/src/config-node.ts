/**
 * Supported NodeJS run modes
 */
export enum ENodeExecMode {
  PROD = 'production',
  DEV = 'dev',
  default = PROD,
}

/** NodeJS running execution mode.
 * @example 'production' */
export const NODE_ENV = process.env.NODE_ENV || ENodeExecMode.default

/** Toggle indicating is the Nodejs runtime environment is a production one.
 * @example true */
export const IS_NODE_PROD = NODE_ENV === ENodeExecMode.PROD

/**
 * Supported execution environment modes
 */
export enum EEnvExecMode {
  PROD = 'prod',
  DEV = 'dev',
  default = PROD,
}

/**
 * Supported execution environment blockchain network modes
 */
export enum EEnvChainMode {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  default = TESTNET,
}

/** Default is 'prod-testnet' if not set otherwise in env var `ENVIRONMENT` */
export const ENVIRONMENT =
  process.env.ENVIRONMENT || EEnvExecMode.default + '-' + EEnvChainMode.default

/** Indicates if the execution environment is set to run in production mode (`prod`) or not */
export const IS_ENV_PROD = ENVIRONMENT.split('-')[0] === EEnvExecMode.PROD

/** Indicates if the execution environment is set to work against `mainnet` blockchain network(s) or not */
export const IS_ENV_MAINNET = ENVIRONMENT.split('-')[1] === EEnvChainMode.MAINNET

/** Domain of the node running environment. Used for restricting the JWT cookie domain
 * @example 'none.com' */
export const ENV_DOMAIN = process.env.ENV_DOMAIN || 'none.com'
