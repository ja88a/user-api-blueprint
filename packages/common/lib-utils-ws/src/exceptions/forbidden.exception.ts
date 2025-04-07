import { IException } from '@jabba01/tuba-lib-utils-data'
import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import {
  AHttpException,
  ExceptionConstants,
  IHttpForbiddenExceptionResponse,
} from '.'

/**
 * A custom exception for forbidden errors.
 */
export class ForbiddenException extends AHttpException {
  /** The error code. */
  @ApiProperty({
    enum: ExceptionConstants.ForbiddenCodes,
    description: 'You do not have permission to perform this action.',
    example: ExceptionConstants.ForbiddenCodes.MISSING_PERMISSIONS,
  })
  code: number

  /** The error message. */
  @ApiProperty({
    description: 'Message for the exception',
    example: 'You do not have permission to perform this action.',
  })
  message: string

  /** The detailed description of the error. */
  @ApiProperty({
    description: 'A description of the error message.',
    example: 'You do not have permission to perform this action.',
  })
  description: string | undefined

  /**
   * Constructs a new ForbiddenException object.
   * @param exception An object containing the exception details.
   *  - message: A string representing the error message.
   *  - cause: An object representing the cause of the error.
   *  - description: A string describing the error in detail.
   *  - code: A number representing internal status code which helpful in future for frontend
   */
  constructor(exception: IException) {
    super(exception, HttpStatus.FORBIDDEN)

    this.code = exception.code
    this.message = exception.message
    this.description = exception.description
  }

  /**
   * Generate an HTTP response body representing the ForbiddenException instance.
   * @param message A string representing the message to include in the response body.
   * @returns An object representing the HTTP response body.
   */
  generateHttpResponseBody = (message?: string): IHttpForbiddenExceptionResponse => {
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
   * A static method to generate an exception forbidden error.
   * @param msg - An optional error message.
   * @returns An instance of the ForbiddenException class.
   */
  static FORBIDDEN = (msg?: string, cause?: any): ForbiddenException => {
    return new ForbiddenException({
      message: msg || 'Access to this resource is forbidden.',
      code: ExceptionConstants.ForbiddenCodes.FORBIDDEN,
      cause: cause,
    })
  }

  /**
   * A static method to generate an exception missing permissions error.
   * @param msg - An optional error message.
   * @returns An instance of the ForbiddenException class.
   */
  static MISSING_PERMISSIONS = (msg?: string, cause?: any): ForbiddenException => {
    return new ForbiddenException({
      message: msg || 'You do not have permission to perform this action.',
      code: ExceptionConstants.ForbiddenCodes.MISSING_PERMISSIONS,
      cause: cause,
    })
  }
}
