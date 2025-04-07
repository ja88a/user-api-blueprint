import { Logger, Module, Scope } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { INQUIRER } from '@nestjs/core/injector/inquirer'
import { UserServiceModule } from '../service/user-service.module'
import { UserController } from './user.controller'

/**
 * Main module for the Web Service `Users Management`
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    UserServiceModule,
  ],
  controllers: [UserController],
  providers: [
    {
      provide: Logger,
      scope: Scope.TRANSIENT,
      inject: [INQUIRER],
      useFactory: (parentClass: object): Logger =>
        new Logger(parentClass.constructor.name),
    },
  ],
  exports: [],
})
export class UserModule {
  constructor(private readonly logger: Logger) {}

  onModuleInit(): void {
    this.logger.log('Init API main module')
  }

  /**
   * Default graceful App shutdown method
   *
   * It is bound to the Nodejs shutdown hooks and gets triggered on any interruptions.
   *
   * @param signal Signal at the origin of this shutdown call, e.g. `SIGINT`
   */
  async onApplicationShutdown(signal: string): Promise<void> {
    this.logger.warn(`Graceful WS shutdown on signal ${signal}`)
    // exit() // problematic with E2E tests
  }
}
