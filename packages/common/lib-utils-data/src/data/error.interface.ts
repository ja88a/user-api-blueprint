export interface IException {
  /** Internal status code */
  code?: number

  /** Message for the exception */
  message: string

  /** Description of the exception */
  description?: string

  /** The error that caused this exception */
  cause?: Error
}
