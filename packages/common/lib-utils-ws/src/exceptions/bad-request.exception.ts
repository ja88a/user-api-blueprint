import { IException } from '@jabba01/tuba-lib-utils-data'
import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { AHttpException } from './exception-http'
import { ExceptionConstants } from './exceptions.constants'
import { IHttpBadRequestExceptionResponse } from './exceptions.interface'

/**
 * A custom exception that represents a BadRequest error.
 */
export class BadRequestException extends AHttpException {
  @ApiProperty({
    enum: ExceptionConstants.BadRequestCodes,
    description: 'A unique code identifying the error.',
    example: ExceptionConstants.BadRequestCodes.VALIDATION_ERROR,
  })
  code: number // Internal status code

  @ApiProperty({
    description: 'Message for the exception',
    example: 'Bad Request',
  })
  message: string // Message for the exception

  @ApiProperty({
    description: 'A description of the error message.',
    example: 'The input provided was invalid',
  })
  description: string // Description of the exception

  /**
   * Constructs a new BadRequestException object.
   * @param exception An object containing the exception details.
   *  - message: A string representing the error message.
   *  - cause: An object representing the cause of the error.
   *  - description: A string describing the error in detail.
   *  - code: A number representing internal status code which helpful in future for frontend
   */
  constructor(exception: IException) {
    super(exception, HttpStatus.BAD_REQUEST)

    this.code = exception.code
    this.message = exception.message
    this.description = exception.description
  }

  /**
   * Generate an HTTP response body representing the BadRequestException instance.
   * @param message A string representing the message to include in the response body.
   * @returns An object representing the HTTP response body.
   */
  generateHttpResponseBody = (
    message?: string,
  ): IHttpBadRequestExceptionResponse => {
    const respMsg = this.generateResponseMessage(message, this.message)
    return {
      message: respMsg,
      description: this.description,
      timestamp: this.timestamp,
      code: this.code,
      traceId: this.traceId,
    }
  }

  /**
   * Returns a new instance of BadRequestException representing an HTTP Request Timeout error.
   * @returns An instance of BadRequestException representing the error.
   */
  static HTTP_REQUEST_TIMEOUT = (): BadRequestException => {
    return new BadRequestException({
      message: 'HTTP Request Timeout',
      code: ExceptionConstants.BadRequestCodes.HTTP_REQUEST_TIMEOUT,
    })
  }

  /**
   * Create a BadRequestException for when a resource already exists.
   * @param {string} [msg] - Optional message for the exception.
   * @returns {BadRequestException} - A BadRequestException with the appropriate error code and message.
   */
  static RESOURCE_ALREADY_EXISTS = (
    msg?: string,
    cause?: any,
  ): BadRequestException => {
    return new BadRequestException({
      message: msg || 'Resource Already Exists',
      code: ExceptionConstants.BadRequestCodes.RESOURCE_ALREADY_EXISTS,
      cause: cause,
    })
  }

  /**
   * Create a BadRequestException for when a resource is not found.
   * @param {string} [msg] - Optional message for the exception.
   * @returns {BadRequestException} - A BadRequestException with the appropriate error code and message.
   */
  static RESOURCE_NOT_FOUND = (msg?: string, cause?: any): BadRequestException => {
    return new BadRequestException({
      message: msg || 'Resource Not Found',
      code: ExceptionConstants.BadRequestCodes.RESOURCE_NOT_FOUND,
      cause: cause,
    })
  }

  /**
   * Returns a new instance of BadRequestException representing a Validation Error.
   * @param msg A string representing the error message.
   * @returns An instance of BadRequestException representing the error.
   */
  static VALIDATION_ERROR = (msg?: string, cause?: any): BadRequestException => {
    return new BadRequestException({
      message: msg || 'Validation Error',
      code: ExceptionConstants.BadRequestCodes.VALIDATION_ERROR,
      cause: cause,
    })
  }

  /**
   * Returns a new instance of BadRequestException representing an Unexpected Error.
   * @param msg A string representing the error message.
   * @returns An instance of BadRequestException representing the error.
   */
  static UNEXPECTED = (msg?: string, cause?: any): BadRequestException => {
    return new BadRequestException({
      message: msg || 'Unexpected Error',
      code: ExceptionConstants.BadRequestCodes.UNEXPECTED_ERROR,
      cause: cause,
    })
  }

  /**
   * Returns a new instance of BadRequestException representing an Invalid Input.
   * @param msg A string representing the error message.
   * @returns An instance of BadRequestException representing the error.
   */
  static INVALID_INPUT = (msg?: string, cause?: any): BadRequestException => {
    return new BadRequestException({
      message: msg || 'Invalid Input',
      code: ExceptionConstants.BadRequestCodes.INVALID_INPUT,
      cause: cause,
    })
  }
}
