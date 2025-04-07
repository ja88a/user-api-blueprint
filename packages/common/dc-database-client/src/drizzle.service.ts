import { Inject, Injectable } from '@nestjs/common'
import { PostgresJsDatabase, drizzle as drizzlePgJs } from 'drizzle-orm/postgres-js'
import { NEST_DRIZZLE_OPTIONS } from './drizzle.constants'
import * as drizzleInterfaces from './drizzle.interfaces'
import postgres from 'postgres'
import { migrate as migratePgJs } from 'drizzle-orm/postgres-js/migrator'

interface IDrizzleService {
  migrate(): Promise<void>
  getDrizzle(): Promise<PostgresJsDatabase>
}

@Injectable()
export class DrizzleService implements IDrizzleService {
  private _drizzle: PostgresJsDatabase<Record<string, unknown>>

  constructor(
    @Inject(NEST_DRIZZLE_OPTIONS)
    private _NestDrizzleOptions: drizzleInterfaces.NestDrizzleOptions,
  ) {}

  test(): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async migrate(): Promise<void> {
    const client = postgres(this._NestDrizzleOptions.url, { max: 1 })
    await migratePgJs(drizzlePgJs(client), this._NestDrizzleOptions.migrationOptions)
  }

  async getDrizzle(): Promise<PostgresJsDatabase<Record<string, unknown>>> {
    if (!this._drizzle) {
      let client: postgres.Sql<Record<string, never>>
      client = postgres(this._NestDrizzleOptions.url)
      this._drizzle = drizzlePgJs(client, this._NestDrizzleOptions.options)
    }
    return this._drizzle
  }
}
