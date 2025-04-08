import { EConflictType, IConflict } from '@jabba01/tuba-lib-utils-data'
import { TUserAccount, TUserAccountNew } from '../../data/user-account.entity'
import {
  EUserAccountStatus,
  EUserAccountType,
  EUserStatus,
  UserTypeDefault,
} from '../../data/user-constants'
import { TUser, TUserNew } from '../../data/user.entity'
import { IUserDatastoreService } from '../user-ds.interface'
import { USERS_SET_SIZE, USERS_1 } from './user-ds.mock-data'

export class UserDatastoreServiceMock implements IUserDatastoreService {
  async testDbConnection(): Promise<string> {
    return new Date().toISOString()
  }

  async retrieveUserAll(): Promise<TUser[]> {
    return Array.from(USERS_1.values())
  }

  async retrieveUserById(id: number): Promise<TUser> {
    if (id < 0) return undefined
    return USERS_1.get(id)
  }

  async retrieveUsersById(ids: number[]): Promise<TUser[]> {
    if (!(ids?.length > 0))
      return []
    return ids.map((id) => USERS_1.get(id)).filter((user) => user?.id > 0)
  }

  async checkUserFieldsUniqueness(user: TUser): Promise<IConflict[]> {
    let conflicts: IConflict[] = []
    USERS_1.forEach((value: TUser, _key: number) => {
      const userStored = value
      if (userStored.handle === user.handle && userStored.id !== user.id)
        conflicts.push({
          name: 'handle',
          type: EConflictType.DB_VALUE_UNIQUE,
          id: '' + userStored.id,
        })
    })
    if (user.account?.length > 0) {
      const accountConflictsProms = user.account.map(
        async (acc) =>
          await this.checkUserAccountFieldsUniqueness(user.id, acc as TUserAccount),
      )
      const accountConflicts = await Promise.all(accountConflictsProms)
      conflicts.push(...accountConflicts.flat())
    }
    return conflicts
  }

  async retrieveUserByAccountIdentifier(
    identifier: string,
    accountType: EUserAccountType,
  ): Promise<TUser[]> {
    let foundUsers: TUser[] = []
    USERS_1.forEach((value: TUser, _key: number) => {
      const accountMatching = value.account.find(
        (acc) => acc.identifier === identifier && acc.type === accountType,
      )
      if (accountMatching) {
        foundUsers.push(value)
      }
    })
    return foundUsers
  }

  async retrieveUserAccountByIdentifier(
    _userId: number,
    _type: EUserAccountType,
    _identifier: string,
  ): Promise<TUserAccount> {
    throw new Error('Method not implemented.')
  }

  async checkUserAccountFieldsUniqueness(
    userId: number,
    account: TUserAccount,
  ): Promise<IConflict[]> {
    // const user = await this.retrieveUserById(userId)
    //if (!user) throw new Error(`Target user '${userId}' not found in DB`)

    const conflicts: IConflict[] = []

    for (let [_key, value] of USERS_1) {
      const userStored = value

      for (let j = 0; j++ < userStored.account.values.length; ) {
        const userAccountStored = userStored.account[j]
        if (
          userAccountStored.identifier === account.identifier &&
          userAccountStored.type !== account.type &&
          userAccountStored.id !== userId
        )
          conflicts.push({
            name: 'account-identifier-' + account.type,
            type: EConflictType.DB_VALUE_UNIQUE,
            id: '' + userAccountStored.id,
          })
      }
    }
    return conflicts
  }

  async storeUser(user: TUserNew & { id?: number }): Promise<TUser> {
    if (!user) throw new Error(`User storage request invalid - no user defined`)

    const existingUser =
      user.id >= 0 ? await this.retrieveUserById(user.id) : undefined

    const conflicts = await this.checkUserFieldsUniqueness(user as TUser)
    if (conflicts?.length > 0)
      throw new Error(
        `User Storage Aborted - Conflicts found: ${JSON.stringify(conflicts)}`,
      )

    const userId =
      existingUser?.id ?? 1000 + (USERS_1.values.length - USERS_SET_SIZE)
    const userName =
      existingUser?.name ??
      user.name ??
      'user-mock_' + new Date().getUTCMilliseconds()
    const userHandle =
      existingUser?.handle ?? userName + '#' + new Date().getMilliseconds()

    const userNew: TUser = {
      ...user,
      id: userId,
      name: userName,
      type: UserTypeDefault,
      handle: userHandle,
      status: EUserStatus.VALID,
      account: user.account.map((accNew) => ({
        ...accNew,
        id: 1000,
        status: EUserAccountStatus.ENABLED,
      })),
    }

    USERS_1.set(userId, userNew)
    return userNew
  }

  async deleteUser(userId: number): Promise<TUser> {
    const user = await this.retrieveUserById(userId)
    if (user) USERS_1.delete(userId)
    return user
  }

  async storeUserAccount(
    _userId: number,
    _newAccount: TUserAccountNew & { id?: number },
  ): Promise<TUserAccount> {
    throw new Error('Method not implemented.')
  }

  async deleteUserAccount(_accountId: number): Promise<TUserAccount> {
    throw new Error('Method not implemented.')
  }
}
