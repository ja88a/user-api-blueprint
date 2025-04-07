import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IException } from '@jabba01/tuba-lib-utils-data'

/**
 * Abstract class for custom exceptions that represent HTTP errors.
 */
export abstract class AHttpException extends HttpException implements IException {
  /** The error that caused this exception. */
  @ApiHideProperty()
  declare cause: Error

  /** Timestamp of the exception */
  @ApiProperty({
    description: 'Timestamp of the exception',
    format: 'date-time',
    example: '2022-12-31T23:59:59.999Z',
  })
  timestamp: string

  /** Trace ID of the request */
  @ApiProperty({
    description: 'Trace ID of the request',
    example: '65b5f773-df95-4ce5-a917-62ee832fcdd0',
  })
  traceId: string // Trace ID of the request

  /**
   * Set the Trace ID of the BadRequestException instance.
   * @param traceId A string representing the Trace ID.
   */
  setTraceId = (traceId: string): void => {
    this.traceId = traceId
  }

  /**
   * Constructs a new Exception object.
   * @param httpStatus The HTTP status code to use in the response.
   * @param exception An object containing the exception details.
   *  - message: A string representing the error message.
   *  - cause: An object representing the cause of the error.
   *  - description: A string describing the error in detail.
   *  - code: A number representing internal status code, helpful for frontend
   */
  constructor(exception: IException, httpStatus: HttpStatus) {
    super(exception.message, httpStatus, {
      cause: exception.cause,
      description: exception.description,
    })

    this.cause = exception.cause
    this.timestamp = new Date().toISOString()
  }

  generateResponseMessage = (message: string, defaultMessage: string): string => {
    if (!message) return defaultMessage
    return message
  }
}
