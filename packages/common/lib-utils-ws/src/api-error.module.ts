import { Global, Logger, Module, Scope, ValidationPipe } from '@nestjs/common'
import { APP_FILTER, APP_PIPE, HttpAdapterHost, INQUIRER } from '@nestjs/core'
import {
  AllExceptionsFilter,
  ValidationExceptionFilter,
  BadRequestExceptionFilter,
  UnauthorizedExceptionFilter,
  ForbiddenExceptionFilter,
  NotFoundExceptionFilter,
} from './filters'
import { BadRequestException } from './exceptions'

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: Logger,
      scope: Scope.TRANSIENT,
      inject: [INQUIRER],
      useFactory: (parentClass: object): Logger =>
        new Logger(parentClass.constructor.name),
    },
    HttpAdapterHost,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: ValidationExceptionFilter },
    { provide: APP_FILTER, useClass: BadRequestExceptionFilter },
    { provide: APP_FILTER, useClass: UnauthorizedExceptionFilter },
    { provide: APP_FILTER, useClass: ForbiddenExceptionFilter },
    { provide: APP_FILTER, useClass: NotFoundExceptionFilter },
    {
      provide: APP_PIPE,
      useFactory: (): ValidationPipe =>
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
          exceptionFactory: (errors) =>
            BadRequestException.INVALID_INPUT(
              `Invalid request - Validation errors: '${JSON.stringify(errors)}' `,
              {
                cause: errors.map((error) => error.constraints),
              },
            ),
        }),
    },
  ],
})
export class AppErrorModule {}
