/** Supported health statuses for the web services */
export enum EHealthStatus {
  /** Service is working as expected */
  OK = 'ok',
  /** Issue(s) detected */
  WARNING = 'warning',
  /** Service is not working */
  ERROR = 'error',
  /** Default value for a service status */
  default = OK,
}

/**
 * Status information for a single service within the web service runtime
 */
export interface IHealthStatus {
  /** Service name / identifier
   * @example 'database' */
  name?: string

  /** Status of the service
   * @example 'ok' */
  status: EHealthStatus

  /** Optional description of the service status
   * @example 'Service is working as expected' */
  info?: string

  /** List of sub-service statuses' */
  services?: IHealthStatus[]

  /** Service version number
   * @example '1.0.0' */
  version?: string
}
