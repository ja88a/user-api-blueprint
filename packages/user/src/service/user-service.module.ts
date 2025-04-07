import { UserDatastoreModule } from '../database'
import { Logger, Module, Scope } from '@nestjs/common'
import { INQUIRER } from '@nestjs/core/injector/inquirer'
import { UserService } from './user.service'
import { UserAccountService } from './user-account.service'

/**
 * Main module for the Web Service `Users Management`
 */
@Module({
  imports: [UserDatastoreModule],
  controllers: [],
  providers: [
    {
      provide: Logger,
      scope: Scope.TRANSIENT,
      inject: [INQUIRER],
      useFactory: (parentClass: object): Logger =>
        new Logger(parentClass.constructor.name),
    },
    UserService,
    UserAccountService,
  ],
  exports: [UserService, UserAccountService],
})
export class UserServiceModule {}
