import {
  TUser,
  EUserStatus,
  TUserAccount,
  EUserAccountStatus,
  EUserAccountType,
  EUserType,
} from '../data'
import { accounts, users } from './user-schema'

export type User = typeof users.$inferSelect & { accounts?: Account[] }
export type UserNew = typeof users.$inferInsert & { accounts: AccountNew[] }

// Extended types

export type Account = typeof accounts.$inferSelect
export type AccountNew = typeof accounts.$inferInsert

// ========================================================================
//
// Conversion methods
//

export function convertUserToTable(user: TUser): UserNew {
  if (!user) return undefined
  return {
    id: user.id,
    status: user.status,

    handle: user.handle,
    name: user.name,
    nameLast: user.nameLast,

    type: user.type,

    accounts: user.account?.map((acc) =>
      convertAccountToTable(acc as TUserAccount, user.id),
    ),

    updatedAt: new Date(),
  }
}

export function convertUserToEntity(userT: User): TUser {
  if (!userT) return undefined

  return {
    id: userT.id,
    status: Object.values(EUserStatus).find((v) => userT.status === v),

    handle: userT.handle,
    name: userT.name,
    nameLast: userT.nameLast,

    type: userT.type
      ? Object.values(EUserType).find((v) => userT.type === v)
      : undefined,

    updatedAt: userT.updatedAt,
    createdAt: userT.createdAt,

    account: convertAccountsToEntity(userT.accounts),
  }
}

export function convertUsersToEntity(users: User[]): TUser[] {
  if (!(users?.length > 0)) return []

  return users.map((u) => convertUserToEntity(u))
}

export function convertAccountToTable(
  account: TUserAccount,
  userId: number,
): AccountNew {
  if (!account) return undefined
  // if (!(userId > 0))
  //   throw new Error(`Invalid user ID '${userId}' for account '${JSON.stringify(account)}'`)

  return {
    id: account.id,
    status: account.status,

    userId: userId,

    type: account.type,
    default: account.default,

    identifier: account.identifier,
    name: account.name,
  }
}

export function convertAccountsToEntity(accounts: Account[]): TUserAccount[] {
  if (!(accounts?.length > 0)) return []

  return accounts.map(
    (accountT) =>
      ({
        id: accountT.id,
        status: Object.values(EUserAccountStatus).find((v) => accountT.status === v),
        type: Object.values(EUserAccountType).find((v) => accountT.type === v),
        default: accountT.default ? true : undefined,
        identifier: accountT.identifier,
        name: accountT.name,
        createdAt: accountT.createdAt,
        updatedAt: accountT.updatedAt,
      }) satisfies TUserAccount,
  )
}
