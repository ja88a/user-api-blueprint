import { IConflict } from '@jabba01/tuba-lib-utils-data'
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
    if (id <= 0 || id > USERS_SET_SIZE - 1) return undefined
    return USERS_1.get(id)
  }

  async retrieveUsersById(ids: number[]): Promise<TUser[]> {
    const results: TUser[] = []
    for (let i = 0; i++ < ids.length; ) {
      const id = ids[i]
      const user = await this.retrieveUserById(id)
      if (user) results.push(user)
    }
    return results
  }

  async checkUserFieldsUniqueness(user: TUser): Promise<IConflict[]> {
    throw new Error('Method not implemented.')
  }

  async retrieveUserByAccountIdentifier(
    identifier: string,
    accountType: EUserAccountType,
  ): Promise<TUser[]> {
    let foundUsers: TUser[] = []
    for (let i = 0; i < USERS_1.values.length; i++) {
      const user = USERS_1.get(i)
      const accountMatching = user.account.find(
        (acc) => acc.identifier === identifier && acc.type === accountType,
      )
      if (accountMatching) {
        foundUsers.push(user)
      }
    }
    return foundUsers
  }

  async checkUserAccountFieldsUniqueness(
    userId: number,
    account: TUserAccount,
  ): Promise<IConflict[]> {
    throw new Error('Method not implemented.')
  }

  async retrieveUserAccountByIdentifier(
    userId: number,
    type: EUserAccountType,
    identifier: string,
  ): Promise<TUserAccount> {
    throw new Error('Method not implemented.')
  }

  async storeUser(user: TUserNew & { id?: number }): Promise<TUser> {
    const nameRandom = 'user-newly-stored_' + new Date().getTime()
    return {
      ...user,
      id: user.id ?? 100,
      name: nameRandom,
      type: UserTypeDefault,
      handle: nameRandom + '#' + new Date().getMilliseconds(),
      status: EUserStatus.VALID,
      account: user.account.map((accNew) => ({
        ...accNew,
        id: 1000,
        status: EUserAccountStatus.ENABLED,
      })),
    }
  }

  async deleteUser(_userId: number): Promise<TUser> {
    throw new Error('Method not implemented.')
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
