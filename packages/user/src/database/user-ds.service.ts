import { DRIZZLE_ORM } from '@jabba01/tuba-dc-database-client'
import {
  EUserAccountType,
  EUserConflictType,
  TUser,
  TUserAccount,
  TUserAccountNew,
  TUserNew,
} from '../data'
import { EConflictType, IConflict } from '@jabba01/tuba-lib-utils-data'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { and, eq, inArray, sql } from 'drizzle-orm'
import * as postgresJs from 'drizzle-orm/postgres-js'
import * as schema from './user-schema'
import { accounts, users } from './user-schema'
import {
  Account,
  convertAccountsToEntity,
  convertAccountToTable,
  convertUsersToEntity,
  convertUserToEntity,
  convertUserToTable,
} from './types-user-ds.utils'
import { MODEL_VERSION_USERS } from './user-ds.constants'
import { IUserDatastoreService } from './user-ds.interface'

/**
 * Data storage service for the Users Management domain
 */
@Injectable()
export class UserDatastoreService implements IUserDatastoreService {
  constructor(
    private readonly logger: Logger,
    @Inject(DRIZZLE_ORM) private conn: postgresJs.PostgresJsDatabase<typeof schema>,
  ) {}

  async testDbConnection(): Promise<string> {
    const dbTime = await this.conn
      .execute(sql`SELECT current_time`)
      .then((res) => res[0].current_time as string)
      .catch((err) => {
        throw new Error(`Failed to connect to Database \nDB ${err}`)
      })
    return dbTime
  }

  async retrieveUserAll(): Promise<TUser[]> {
    const res = await this.conn.select().from(users).execute()
    return convertUsersToEntity(res)
  }

  async retrieveUserById(id: number): Promise<TUser> {
    if (!(id > 0)) return undefined

    const user = await this.conn.query.users
      .findFirst({
        where: eq(users.id, id),
        with: { accounts: true },
      })
      .catch((err) => {
        throw new Error(`Failed to retrieve User '${id}' from DB \n${err}`)
      })

    return convertUserToEntity(user)
  }

  async retrieveUsersById(ids: number[]): Promise<TUser[]> {
    if (!(ids?.length > 0)) {
      this.logger.warn(
        `No user IDs provided for retrieval: '${ids}' - returning an empty set`,
      )
      return []
    }

    // Filter out undefined IDs
    const filteredIds = ids.filter((id) => id > 0)
    if (!(filteredIds?.length > 0)) {
      this.logger.warn(
        `No valid user IDs provided for retrieval: '${ids}' - returning an empty set`,
      )
      return []
    }

    const user = await this.conn.query.users.findMany({
      where: inArray(users.id, filteredIds),
      with: { accounts: true },
    })

    return convertUsersToEntity(user)
  }

  async retrieveUserByAccountIdentifier(
    identifier: string,
    accountType: EUserAccountType,
  ): Promise<TUser[]> {
    if (!identifier || !accountType) return undefined

    const accountWithUser = await this.conn.query.accounts.findMany({
      where: and(
        eq(accounts.identifier, identifier),
        eq(accounts.type, accountType),
      ),
      with: { user: { with: { accounts: true } } },
    })

    if (!(accountWithUser?.length > 0)) return undefined

    return accountWithUser.map((account) => convertUserToEntity(account.user))
  }

  async checkUserFieldsUniqueness(user: TUser): Promise<IConflict[]> {
    const userT = convertUserToTable(user)
    const resUsers = await this.conn
      .select({
        id: users.id,
        name: users.name,
        handle: users.handle,
      })
      .from(users)
      .where(eq(users.handle, userT.handle))

    const fieldConflicts: IConflict[] = []
    for (const entry of resUsers) {
      if (entry.handle == userT.handle && entry.id !== userT.id)
        fieldConflicts.push({
          id: '' + entry.id,
          name: EUserConflictType.USER_HANDLE,
          type: EConflictType.DB_VALUE_UNIQUE,
        })
    }

    if (!(userT.accounts?.length > 0)) return fieldConflicts

    const accountsConflicts = await Promise.all(
      user.account?.map((acc) =>
        this.checkUserAccountFieldsUniqueness(user.id, acc as TUserAccount),
      ),
    ).then((res) => res.flat())

    return [...fieldConflicts, ...accountsConflicts]
  }

  async checkUserAccountFieldsUniqueness(
    userId: number,
    account: TUserAccount,
  ): Promise<IConflict[]> {
    const accountT = convertAccountToTable(account, 0)

    const resAccountsT = await this.conn
      .select({
        id: accounts.id,
        type: accounts.type,
        identifier: accounts.identifier,
        userId: accounts.userId,
      })
      .from(accounts)
      .where(
        and(
          eq(accounts.identifier, accountT.identifier),
          eq(accounts.type, accountT.type),
        ),
      )

    let fieldConflicts: IConflict[] = []
    resAccountsT.forEach((entry) => {
      if (entry.id !== accountT.id && entry.userId === userId)
        fieldConflicts.push({
          id: '' + entry.id,
          name: 'account-identifier',
          type: EConflictType.DB_VALUE_UNIQUE,
        })
    })

    return fieldConflicts
  }

  async retrieveUserAccountByIdentifier(
    userId: number,
    type: EUserAccountType,
    identifier: string,
  ): Promise<TUserAccount> {
    if (!(userId > 0 && identifier?.length > 0 && type?.length > 0)) {
      this.logger.warn(
        `Ignoring invalid User Account specification: '${identifier}' of type '${type}' for User '${userId}'`,
      )
      return undefined
    }
    const account = await this.conn.query.accounts.findFirst({
      where: and(
        eq(accounts.userId, userId),
        eq(accounts.type, type),
        eq(accounts.identifier, identifier),
      ),
    })

    return convertAccountsToEntity([account])?.[0]
  }

  // ========================================================================
  //
  // WRITE Methods
  //

  async storeUser(user: TUserNew & { id?: number }): Promise<TUser> {
    const userT = convertUserToTable(user as TUser)
    if (!userT) return undefined

    userT.mv = MODEL_VERSION_USERS
    userT.updatedAt = new Date()

    let res
    if (userT.id > 0) {
      this.logger.log(`Updating User info in DB: ${JSON.stringify(userT)}`)
      res = await this.conn
        .update(users)
        .set(userT)
        .where(eq(users.id, userT.id))
        .returning()
        .catch((err) => {
          throw new Error(
            `Failed to update User entry in DB. Submitted: '${JSON.stringify(userT)}' \nDB ${err}`,
          )
        })
    } else {
      this.logger.log(`Inserting new User info in DB: ${JSON.stringify(userT)}`)
      res = await this.conn
        .insert(users)
        .values(userT)
        .returning()
        .catch((err) => {
          throw new Error(
            `Failed to insert new user entry in DB. Submitted: '${JSON.stringify(userT)}' \nDB ${err}`,
          )
        })
    }

    if (!(res?.length > 0)) {
      this.logger.error(
        `User creation in DB failed - Submitted: ${JSON.stringify(userT)}`,
      )
      return undefined
    }

    // User sub-accounts
    if (user.account?.length > 0) {
      for (const acc of user.account)
        await this.storeUserAccount(res[0].id, acc).catch((err) => {
          throw new Error(
            `Failed to store User Account '${JSON.stringify(acc)}' for User '${res[0].id}' in DB \n${err}`,
          )
        })
    }

    return await this.retrieveUserById(res[0].id)
  }

  async storeUserAccount(
    userId: number,
    newAccount: TUserAccountNew & { id?: number },
  ): Promise<TUserAccount> {
    if (!newAccount) return undefined

    const accountT = convertAccountToTable(newAccount as TUserAccount, userId)
    const existingAccountId =
      accountT.id ||
      (await this.conn
        .select({ id: accounts.id })
        .from(accounts)
        .where(
          and(
            eq(accounts.userId, accountT.userId),
            eq(accounts.type, accountT.type),
            eq(accounts.identifier, accountT.identifier),
          ),
        )
        .limit(1)
        .then((res) => res?.[0]?.id))

    if (accountT.default) {
      // Ensure there is not already a default account for the type of account
      const actualDefaultAccountId = await this.conn
        .select({ id: accounts.id })
        .from(accounts)
        .where(
          and(
            eq(accounts.userId, accountT.userId),
            eq(accounts.type, accountT.type),
            eq(accounts.default, true),
          ),
        )
        .limit(1)
        .then((res) => res?.[0]?.id)
      if (actualDefaultAccountId > 0)
        await this.conn
          .update(accounts)
          .set({ default: false })
          .where(eq(accounts.id, actualDefaultAccountId))
    }

    let res: Account[] = []
    if (existingAccountId > 0) {
      res = await this.conn
        .update(accounts)
        .set({
          status: accountT.status,
          userId: accountT.userId,
          type: accountT.type,
          default: accountT.default ? true : undefined,
          identifier: accountT.identifier,
          name: accountT.name,
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, existingAccountId))
        .returning()
        .catch((err) => {
          throw new Error(
            `Failed to update user Account '${existingAccountId}' in DB. Submitted: '${JSON.stringify(accountT)}' \nDB ${err}`,
          )
        })
      this.logger.log(
        `Updated User Account '${res?.[0]?.id}' in DB: ${JSON.stringify(accountT)}`,
      )
    } else {
      res = await this.conn
        .insert(accounts)
        .values(accountT)
        .returning()
        .catch((err) => {
          throw new Error(
            `Failed to insert new user Account entry in DB. Submitted: '${JSON.stringify(accountT)}' \nDB ${err}`,
          )
        })
      this.logger.log(
        `Inserted new User Account in DB with ID '${res?.[0]?.id}': ${JSON.stringify(accountT)}`,
      )
    }

    if (res?.length !== 1)
      throw new Error(
        `Unexpected number of User Accounts stored: ${JSON.stringify(res)} - Result: '${JSON.stringify(res)}'`,
      )

    return convertAccountsToEntity(res)[0]
  }

  async deleteUser(userId: number): Promise<TUser> {
    if (!(userId > 0)) return undefined

    // Delete the user accounts
    const removedAccounts = await this.conn
      .delete(accounts)
      .where(eq(accounts.userId, userId))
      .returning()
      .catch((err) => {
        throw new Error(
          `Failed to delete User Accounts for User '${userId}' from DB \nDB ${err}`,
        )
      })

    this.logger.warn(
      `Deleted ${removedAccounts.length} sub-accounts for User '${userId}': ${JSON.stringify(removedAccounts)}`,
    )

    // Delete the user
    const removedUsers = await this.conn
      .delete(users)
      .where(eq(users.id, userId))
      .returning()
      .catch((err) => {
        throw new Error(`Failed to delete User '${userId}' from DB \nDB ${err}`)
      })

    if (removedUsers?.length !== 1)
      throw new Error(
        `Unexpected number (${removedUsers?.length}) of users deleted based on user ID '${userId}': ${JSON.stringify(removedUsers)}`,
      )

    this.logger.warn(`Deleted User '${userId}': ${JSON.stringify(removedUsers)}`)

    return convertUserToEntity({
      ...removedUsers[0],
      accounts: removedAccounts,
    })
  }

  async deleteUserAccount(accountId: number): Promise<TUserAccount> {
    if (!(accountId > 0)) return undefined

    const removedAccountsT = await this.conn
      .delete(accounts)
      .where(eq(accounts.id, accountId))
      .returning()
      .catch((err) => {
        throw new Error(
          `Failed to delete User Account '${accountId}' from DB \nDB ${err}`,
        )
      })

    if (removedAccountsT.length > 1)
      throw new Error(
        `Unexpected number (${removedAccountsT.length}) of accounts deleted: ${JSON.stringify(
          removedAccountsT,
        )}`,
      )

    this.logger.warn(
      `Deleted Account '${accountId}' for User '${removedAccountsT?.[0]?.userId}': ${JSON.stringify(removedAccountsT)}`,
    )

    return convertAccountsToEntity(removedAccountsT)[0]
  }

  // async onApplicationShutdown() {
  //   await this.conn.session.client.end()
  // }
}
