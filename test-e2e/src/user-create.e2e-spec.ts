import {
  UserAccountDtoStatusEnum,
  UserAccountDtoTypeEnum,
  UserDto,
  UserDtoStatusEnum,
  UserDtoTypeEnum,
  UserSearchResultDto,
} from '@jabba01/tuba-api-client-aio'
import { ApiService } from './ApiClient.helper'
import { TestSessionHelper } from './TestSession.helper'
import { logger as loggerW } from '@jabba01/tuba-lib-utils-common'
import { USER_TEST_DEFAULT_ACCOUNT_ADDR } from './Test.constant'
import { extractErrorMsg } from './TestUtils'

const logContext = 'UserCreate-E2E_Test'
const logger = loggerW.child({ context: logContext })

describe('User Create (e2e)', () => {
  const apiServiceUserTest = new ApiService()
  const sessionHelperUserTest = new TestSessionHelper()

  const apiServiceUserNew = new ApiService()
  const sessionHelperUserNew = new TestSessionHelper()

  let userTest: UserDto
  let userNew: UserDto
  const newUserName = 'Test User ' + new Date().toISOString()
  const newUserEmail = 'test.user@fake.com'
  const newUserPwd = 'Test12345!'
  const newUserWalletAddr = '0xC8ed59E38A779E34eE5E75A744DC6C48B7830b03'

  beforeAll(async () => {
    await sessionHelperUserTest.initApiService(apiServiceUserTest)
  })

  beforeEach(async () => {})

  afterAll(async () => {
    await Promise.all([sessionHelperUserTest.removeUsersCreated()]).catch((err) => {
      logger.error(`Failed to remove created users: ${err.stack ?? err}`)
    })
  })

  // ==========================================================================

  it(`Create New User`, async () => {
    expect(userNew).toBeUndefined()

    userNew = await sessionHelperUserNew.initApiService(apiServiceUserNew, true, {
      email: newUserEmail,
      password: newUserPwd,
      walletAddress: '',
    })
    expect(userNew).toBeDefined()
    expect(userNew.id).toBeGreaterThan(0)

    expect(userNew.type).toEqual(UserDtoTypeEnum.Individual)
    expect(userNew.status).toEqual(UserDtoStatusEnum.Valid)

    expect(userNew.name).toEqual(newUserName)
    expect(userNew.nameLast).toBeUndefined()
    expect(userNew.account?.length).toBeGreaterThanOrEqual(1)

    expect(userNew.id).toBeGreaterThan(0)

    expect(userNew.name).toEqual(newUserName)
    expect(userNew.nameLast).toBeUndefined()

    expect(userNew.status).toEqual(UserAccountDtoStatusEnum.Enabled)
    expect(userNew.type).toEqual(UserDtoTypeEnum.Individual)

    expect(userNew.account).toBeDefined()
    expect(userNew.account.length).toEqual(1)
    expect(userNew.account[0].type).toEqual(UserAccountDtoTypeEnum.Email)
    expect(userNew.account[0].identifier).toEqual(newUserEmail)
    expect(userNew.account[0].status).toEqual(UserAccountDtoStatusEnum.Enabled)
  })

  it(`Get New User w/ non-registered Account`, async () => {
    // unexisting test account
    const user = await apiServiceUserTest.apis.users
      .getUserByAccount({
        userAccountIdDto: {
          identifier: newUserWalletAddr,
          type: UserAccountDtoTypeEnum.Wallet,
        },
      })
      .catch(async (err): Promise<UserDto> => {
        const { errMsg } = await extractErrorMsg(err)
        logger.info(
          `Expected failure to get User from an unknown Account: \n${errMsg}`,
        )
        expect(err).toBeDefined()
        return undefined
      })
    expect(user).toBeUndefined()
  })

  it(`Get New User w/ registered Account`, async () => {
    const user = await apiServiceUserTest.apis.users
      .getUserByAccount({
        userAccountIdDto: {
          identifier: newUserWalletAddr,
          type: UserAccountDtoTypeEnum.Wallet,
        },
      })
      .catch(async (err): Promise<UserDto> => {
        const { errMsg } = await extractErrorMsg(err)
        logger.error(
          `Expected failure to get User from an unknown Account: \n${errMsg}`,
        )
        expect(err).toBeUndefined()
        return undefined
      })
    expect(user).toBeDefined()
    expect(user.id).toEqual(userNew.id)
  })

  it(`should search for an existing user by its account`, async () => {
    const result = await apiServiceUserTest.apis.users
      .searchUsers({
        userSearchFilterDto: {
          user: [
            {
              accountRef: {
                identifier: USER_TEST_DEFAULT_ACCOUNT_ADDR,
                type: UserAccountDtoTypeEnum.Wallet,
              },
            },
          ],
        },
      })
      .catch(async (err): Promise<UserSearchResultDto> => {
        const errBody = await err.response?.json()
        logger.error(
          `Failed to search User by Account: ${err.stack ? err.stack : err} \nResponse: ${JSON.stringify(errBody)}`,
        )
        expect(err).toBeUndefined()
        return undefined
      })
    expect(result).toBeDefined()
    expect(result.user).toBeDefined()
    expect(result.user.length).toEqual(1)
    expect(result.user[0].id).toBeGreaterThan(0)
  })

  it(`should search for an unknown user by its account`, async () => {
    const result = await apiServiceUserTest.apis.users
      .searchUsers({
        userSearchFilterDto: {
          user: [
            {
              accountRef: {
                identifier: '0x0E4716Dd910adeB96D9A82E2a7780261E3D947AA',
                type: UserAccountDtoTypeEnum.Wallet,
              },
            },
          ],
        },
      })
      .catch(async (err): Promise<UserSearchResultDto> => {
        const errBody = await err.response?.json()
        logger.debug(
          `Failed to search User by Account \nError: ${err.stack ? err.stack : err} \nResponse: ${JSON.stringify(errBody)}`,
        )
        expect(err).toBeUndefined()
        return undefined
      })
    expect(result).toBeDefined()
    expect(result.user).toBeDefined()
    expect(result.user.length).toEqual(0)
  })
})
