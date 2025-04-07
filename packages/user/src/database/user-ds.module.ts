import {
  DB_DRIVER_DEFAULT,
  DB_MIGRATION_DIR,
  NestDrizzleModule,
  databaseConnectURL,
} from '@jabba01/tuba-dc-database-client'
import { Logger, Module, Scope } from '@nestjs/common'
import { INQUIRER } from '@nestjs/core'
import * as schema from './user-schema'
import { DB_NAME_DEFAULT } from './user-ds.constants'
import { UserDatastoreService } from './user-ds.service'
import { exit } from 'node:process'

/**
 * Authentication datastore module
 */
@Module({
  imports: [
    NestDrizzleModule.forRootAsync({
      useFactory: () => {
        return {
          driver: DB_DRIVER_DEFAULT,
          url: databaseConnectURL(DB_NAME_DEFAULT),
          options: { schema },
          migrationOptions: { migrationsFolder: DB_MIGRATION_DIR },
        }
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: Logger,
      scope: Scope.TRANSIENT,
      inject: [INQUIRER],
      useFactory: (parentClass: object): Logger =>
        new Logger(parentClass.constructor.name),
    },
    UserDatastoreService,
  ],
  exports: [UserDatastoreService],
})
export class UserDatastoreModule {
  constructor(
    private readonly logger: Logger,
    private readonly dbService: UserDatastoreService,
  ) {}

  async onModuleInit(): Promise<void> {
    const testRes = await this.dbService.testDbConnection().catch((err) => {
      this.logger.error(
        `Exiting - DB Service fails to connect \n${err.stack ? err.stack : err}`,
      )
      exit(1)
    })
    this.logger.debug(`DB Service initialized - Output: '${testRes}'`)
  }
}
