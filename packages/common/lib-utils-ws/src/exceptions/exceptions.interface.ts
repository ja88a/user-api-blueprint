interface IHttpExceptionResponse {
  code: number
  message: string
  description: string
  timestamp: string
  traceId: string
}

export interface IHttpBadRequestExceptionResponse extends IHttpExceptionResponse {}

export interface IHttpInternalServerErrorExceptionResponse
  extends IHttpExceptionResponse {}

export interface IHttpUnauthorizedExceptionResponse extends IHttpExceptionResponse {}

export interface IHttpForbiddenExceptionResponse extends IHttpExceptionResponse {}
