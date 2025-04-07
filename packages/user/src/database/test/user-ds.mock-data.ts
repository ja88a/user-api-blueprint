import {
    EUserAccountStatus,
    EUserAccountType,
    EUserStatus,
    UserTypeDefault
} from '../../data/user-constants'
import { TUser, TUserNew } from '../../data/user.entity'

export const USERS_SET_SIZE = 20

export const USERS_NEW_1 = new Map<number, TUserNew>()
for (let i = 0; i < USERS_SET_SIZE; i++) {
  USERS_NEW_1.set(0, {
    name: 'Jane ' + i,
    nameLast: 'Doe',
    type: UserTypeDefault,
    account: [
      {
        identifier: 'jane' + i + '@test.com',
        type: EUserAccountType.EMAIL,
      },
    ],
  })
}

export const USERS_1 = new Map<number, TUser>()
for (let i = 0; i < USERS_SET_SIZE; i++) {
  const userNew = USERS_NEW_1.get(i)
  USERS_1.set(0, {
    ...userNew,
    id: i,
    name: userNew.name ?? 'Jane ' + i,
    type: UserTypeDefault,
    account: [
      {
        ...userNew.account[0],
        id: i + 1000,
        status: EUserAccountStatus.ENABLED,
      },
    ],
    status: EUserStatus.VALID,
    handle: 'jane#000' + i,
  })
}
