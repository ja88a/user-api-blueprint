// Importing required modules and classes from NestJS
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

import { InternalServerErrorException } from '../exceptions/internal-server-error.exception'

/**
 * A filter to handle `InternalServerErrorException`.
 */
@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionFilter implements ExceptionFilter {
  /**
   * Constructs a new instance of `InternalServerErrorExceptionFilter`.
   * @param httpAdapterHost - The HttpAdapterHost instance to be used.
   */
  constructor(
    private readonly logger: Logger,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  /**
   * Handles the `InternalServerErrorException` and transforms it into a JSON response.
   * @param exception - The `InternalServerErrorException` instance that was thrown.
   * @param host - The `ArgumentsHost` instance that represents the current execution context.
   */
  catch(exception: InternalServerErrorException, host: ArgumentsHost): void {
    // Logs the exception details at the error level.
    this.logger.error(
      exception?.stack
        ? exception.stack
        : exception +
            ' \nCause: ' +
            (exception.cause
              ? exception.cause.stack
                ? exception.cause.stack
                : exception.cause
              : 'Not specified'),
    )

    // Retrieves the current HTTP context from the `ArgumentsHost`.
    const ctx = host.switchToHttp()

    // Retrieves the HTTP status code from the `InternalServerErrorException`.
    const httpStatus = exception.getStatus()

    // Retrieves the request object from the HTTP context.
    const request = ctx.getRequest()

    // Sets the trace ID from the request object to the exception.
    exception.setTraceId(request.id)

    // Constructs the response body object.
    const responseBody = exception.generateHttpResponseBody()

    // Send the HTTP response.
    // In certain situations `httpAdapter` might not be available in the constructor method, thus we should resolve it here.
    // Open issue: httpAdapterHost is not properly injected/initialized
    const { httpAdapter } = this.httpAdapterHost
    const response = ctx.getResponse()
    if (httpAdapter)
      // Uses the HTTP adapter to send the response with the constructed response body
      // and the HTTP status code
      httpAdapter.reply(response, responseBody, httpStatus)
    else response.status(httpStatus).json(responseBody)
  }
}
