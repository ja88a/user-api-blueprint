import { AppErrorModule } from '@jabba01/tuba-lib-utils-ws'
import { UserModule, UserServiceModule } from '@jabba01/tuba-ws-user'
import { Logger, Module, Scope } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { INQUIRER } from '@nestjs/core/injector/inquirer'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    AppErrorModule,
    UserModule,
    UserServiceModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: Logger,
      scope: Scope.TRANSIENT,
      inject: [INQUIRER],
      useFactory: (parentClass: object): Logger =>
        new Logger(parentClass.constructor.name),
    },
    AppService,
  ],
  exports: [],
})
export class AppModule {
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
    this.logger.warn(`Graceful App Shutdown on signal ${signal}`)
    // exit() // problematic with E2E tests
  }
}
