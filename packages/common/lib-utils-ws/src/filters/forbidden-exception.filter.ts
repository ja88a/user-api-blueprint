import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

import { ForbiddenException } from '../exceptions'

/**
 * Exception filter to handle unauthorized exceptions
 */
@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  /**
   * Method to handle unauthorized exceptions
   * @param exception - The thrown unauthorized exception
   * @param host - The arguments host
   */
  catch(exception: ForbiddenException, host: ArgumentsHost): void {
    this.logger.warn(
      `${exception}\nCause: ${exception.cause ? (exception.cause.stack ? exception.cause.stack : JSON.stringify(exception.cause)) : 'Not specified'}`,
    )

    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    const httpStatus = exception.getStatus()

    // Example of fetching path to attach path inside response object
    const request = ctx.getRequest()
    // const path = httpAdapter.getRequestUrl(request)

    // Sets the trace ID from the request object to the exception.
    exception.setTraceId(request.id)

    // Constructs the response body object.
    const responseBody = exception.generateHttpResponseBody()

    // Uses the HTTP adapter to send the response with the constructed response body
    // and the HTTP status code.
    const response = ctx.getResponse()
    if (httpAdapter) httpAdapter.reply(response, responseBody, httpStatus)
    else response.status(httpStatus).json(responseBody)
  }
}
