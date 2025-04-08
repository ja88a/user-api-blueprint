import { TUser, TUserAccount, obfuscateUserIdentifier } from '../../data'
import { UserAccountDto, UserDto } from '.'

export const convertUserAccountsToDto = (
  accounts: TUserAccount[],
  _withDetails?: boolean,
): UserAccountDto[] => {
  if (!accounts) return undefined

  return accounts.map((account) => {
    return {
      id: account.id,
      status: account.status,

      type: account.type,
      default: account.default,

      identifier: true // TODO reinforce `withDetails` once user auth/role is integrated
        ? account.identifier
        : obfuscateUserIdentifier(account.type, account.identifier),
      name: account.name,

      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    } satisfies UserAccountDto
  })
}

export const convertUserToDto = (user: TUser, withDetails?: boolean): UserDto => {
  if (!user) return undefined

  return {
    id: user.id,
    status: user.status,

    handle: user.handle,
    name: user.name,
    nameLast: user.nameLast,

    type: user.type,

    account: convertUserAccountsToDto(user.account, withDetails),

    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
  }
}
