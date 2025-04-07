import { IException } from '@jabba01/tuba-lib-utils-data'
import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import {
  AHttpException,
  ExceptionConstants,
  IHttpInternalServerErrorExceptionResponse,
} from '.'

/**
 * Exception class for Internal Server Error
 */
export class InternalServerErrorException extends AHttpException {
  @ApiProperty({
    enum: ExceptionConstants.InternalServerErrorCodes,
    description: 'A unique code identifying the error.',
    example: ExceptionConstants.InternalServerErrorCodes.INTERNAL_SERVER_ERROR,
  })
  code: number // Internal status code

  @ApiProperty({
    description: 'Message for the exception',
    example: 'An unexpected error occurred while processing your request.',
  })
  message: string // Message for the exception

  @ApiProperty({
    description: 'A description of the error message.',
    example:
      'The server encountered an unexpected condition that prevented it from fulfilling the request. This could be due to an error in the application code, a misconfiguration in the server, or an issue with the underlying infrastructure. Please try again later or contact the server administrator if the problem persists.',
  })
  description: string // Description of the exception

  /**
   * Constructs a new InternalServerErrorException object.
   * @param exception An object containing the exception details.
   *  - message: A string representing the error message.
   *  - cause: An object representing the cause of the error.
   *  - description: A string describing the error in detail.
   *  - code: A number representing internal status code which helpful in future for frontend
   */
  constructor(exception: IException) {
    super(exception, HttpStatus.INTERNAL_SERVER_ERROR)

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
  ): IHttpInternalServerErrorExceptionResponse => {
    const respMsg = this.generateResponseMessage(message, this.message)
    return {
      code: this.code,
      message: respMsg,
      description: this.description,
      timestamp: this.timestamp,
      traceId: this.traceId,
    }
  }

  /**
   * Returns a new instance of InternalServerErrorException with a standard error message and code
   * @param error Error object causing the exception
   * @returns A new instance of InternalServerErrorException
   */
  static INTERNAL_SERVER_ERROR = (
    msg?: string,
    cause?: any,
  ): InternalServerErrorException => {
    return new InternalServerErrorException({
      message:
        msg ||
        'We are sorry, something went wrong on our end. Please try again later or contact our support team for assistance.',
      code: ExceptionConstants.InternalServerErrorCodes.INTERNAL_SERVER_ERROR,
      cause: cause,
    })
  }

  /**
   * Returns a new instance of InternalServerErrorException with a custom error message and code
   * @param error Error object causing the exception
   * @returns A new instance of InternalServerErrorException
   */
  static UNEXPECTED_ERROR = (
    msg?: string,
    cause?: any,
  ): InternalServerErrorException => {
    return new InternalServerErrorException({
      message: msg || 'An unexpected error occurred while processing the request.',
      code: ExceptionConstants.InternalServerErrorCodes.UNEXPECTED_ERROR,
      cause: cause,
    })
  }
}
