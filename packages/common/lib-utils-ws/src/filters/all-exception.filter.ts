import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

/**
 * Catches all exceptions thrown by the application and sends an appropriate HTTP response.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * Creates an instance of `AllExceptionsFilter`.
   *
   * @param {HttpAdapterHost} httpAdapterHost - the HTTP adapter host
   */
  constructor(
    private readonly logger: Logger,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  /**
   * Catches an exception and sends an appropriate HTTP response.
   *
   * @param {*} exception - the exception to catch
   * @param {ArgumentsHost} host - the arguments host
   * @returns {void}
   */
  catch(exception: any, host: ArgumentsHost): void {
    // Log the exception.
    this.logger.error(
      exception?.stack
        ? exception.stack
        : exception +
            ' \nCause: ' +
            (exception.cause
              ? exception.cause.stack
                ? exception.cause.stack
                : JSON.stringify(exception.cause)
              : 'Unknown'),
    )

    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const request = ctx.getRequest()
    // Construct the response body.
    const responseBody = {
      error: exception.code,
      message: exception.message,
      description: exception.description,
      timestamp: new Date().toISOString(),
      traceId: request.id,
    }

    // Send the HTTP response.
    const response = ctx.getResponse()
    if (httpAdapter) httpAdapter.reply(response, responseBody, httpStatus)
    else response.status(httpStatus).json(responseBody)
  }
}
