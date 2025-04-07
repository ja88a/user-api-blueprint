import {
  EUserAccountType,
  TUserAccountIdentifier,
  TUserNew,
  USER_NAME_DEFAULT_UNKNOWN_PREFIX,
} from '.'
import {
  generateRandomId,
  generateUserHandle,
  generateUserNameFromEmail,
} from '@jabba01/tuba-lib-utils-common'

export const computeUserNameDefault = (
  userAccounts: TUserAccountIdentifier[],
): string => {
  if (!userAccounts || userAccounts.length == 0)
    throw new Error(`User name computation fails: No user accounts provided`)

  const emailAddr = userAccounts.find(
    (acc) => acc.type === EUserAccountType.EMAIL,
  )?.identifier
  if (emailAddr) return generateUserNameFromEmail(emailAddr)

  const cryptoAddr = userAccounts.find(
    (acc) => acc.type === EUserAccountType.WALLET,
  )?.identifier
  if (cryptoAddr)
    return (
      cryptoAddr.substring(2, 5) +
      '...' +
      cryptoAddr.substring(cryptoAddr.length - 5)
    )

  return USER_NAME_DEFAULT_UNKNOWN_PREFIX + generateRandomId(9)
}

export const computeUserHandle = (user: TUserNew): string => {
  if (user.name?.length > 3) return generateUserHandle(user.name)
  return generateUserHandle(computeUserNameDefault(user.account))
}

export const obfuscateUserIdentifier = (
  type: EUserAccountType,
  identifier: string,
): string => {
  if (!identifier) return undefined
  if (type === EUserAccountType.WALLET) {
    return identifier.slice(0, 7) + '***' + identifier.slice(-5)
  } else if (type === EUserAccountType.EMAIL) {
    const [name, domain] = identifier.split('@')
    return name.slice(0, 2) + '***' + name.slice(-2) + '@' + domain
  } else {
    return identifier.slice(0, 2) + '***' + identifier.slice(-2)
  }
}
