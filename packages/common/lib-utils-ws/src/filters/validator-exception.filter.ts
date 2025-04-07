import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { ValidationError } from 'class-validator'
import { BadRequestException } from '../exceptions/bad-request.exception'

/**
 * An exception filter to handle validation errors thrown by class-validator.
 */
@Catch(ValidationError)
@Injectable()
export class ValidationExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  /**
   * Handle a validation error.
   * @param exception The validation error object.
   * @param host The arguments host object.
   */
  catch(exception: ValidationError, host: ArgumentsHost): void {
    this.logger.log(`Validation ERROR: ${JSON.stringify(exception)}`)

    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    const httpStatus = HttpStatus.UNPROCESSABLE_ENTITY
    const request = ctx.getRequest()

    // Example of fetching path to attach path inside response object
    // const path = httpAdapter.getRequestUrl(request)
    const response = ctx.getResponse()

    const errorMsg = exception.constraints || exception.children?.[0]?.constraints
    if (!errorMsg) {
      this.logger.error('Unexpected validation error structure', exception)
      return
    }

    // Create a new BadRequestException with the validation error message.
    const err = BadRequestException.VALIDATION_ERROR(Object.values(errorMsg)[0])
    const responseBody = {
      error: err.code,
      message: err.message,
      timestamp: new Date().toISOString(),
      traceId: request.id,
    }

    // Send the HTTP response.
    if (httpAdapter) {
      httpAdapter.reply(response, responseBody, httpStatus)
    } else if (typeof response.status === 'function') {
      response.status(httpStatus).json(responseBody)
    } else if (typeof response.end === 'function') {
      response.writeHead(httpStatus, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify(responseBody))
    } else {
      throw new Error('Unable to send response through normal means')
    }
  }
}
