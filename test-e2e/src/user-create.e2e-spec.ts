import {
  UserAccountDtoStatusEnum,
  UserAccountDtoTypeEnum,
  UserAccountNewDtoTypeEnum,
  UserDto,
  UserDtoStatusEnum,
  UserDtoTypeEnum,
  UserSearchResultDto,
} from '@jabba01/tuba-api-client-aio'
import { logger as loggerW } from '@jabba01/tuba-lib-utils-common'
import { ApiService } from './ApiClient.helper'
import { TestSessionHelper } from './TestSession.helper'
import { getRandomInt } from './TestUtils'

const logContext = 'UserCreate-E2E_Test'
const logger = loggerW.child({ context: logContext })

describe('User Create (e2e)', () => {
  const apiService = new ApiService()
  const testSessionHelper = new TestSessionHelper()

  let userNew: UserDto
  const newUserName = 'Test User ' + new Date().toISOString()
  const newUserEmail = 'test.user' + getRandomInt(1000, 100000) + '@test-e2e.com'

  beforeAll(async () => {
    await testSessionHelper.initApiService(apiService)
  })

  beforeEach(async () => {})

  afterAll(async () => {
    await Promise.all([testSessionHelper.removeUsersCreated()]).catch((err) => {
      logger.error(`Failed to remove created users: ${err.stack ?? err}`)
    })
  })

  // ==========================================================================

  it(`should not retrieve the user not created yet`, async () => {
    const result = await apiService.apis.users
      .searchUsers({
        userSearchFilterDto: {
          user: [
            {
              accountRef: {
                identifier: newUserEmail,
                type: UserAccountDtoTypeEnum.Email,
              },
            },
          ],
        },
      })
      .catch(async (err): Promise<UserSearchResultDto> => {
        const errBody = await err.response?.json()
        logger.debug(
          `Failed to search User by Account \nError: ${err.stack ?? err} \nResponse: ${JSON.stringify(errBody)}`,
        )
        expect(err).toBeUndefined()
        return undefined
      })
    expect(result).toBeDefined()
    expect(result.user).toBeDefined()
    expect(result.user.length).toEqual(0)
  })

  it(`should Create New User`, async () => {
    expect(userNew).toBeUndefined()

    userNew = await apiService.apis.users.createUser({
      userNewDto: {
        name: newUserName,
        account: [
          {
            identifier: newUserEmail,
            type: UserAccountNewDtoTypeEnum.Email,
          },
        ],
      },
    })
    expect(userNew).toBeDefined()
    expect(userNew.id).toBeGreaterThan(0)

    // Track for later removal from the DB
    testSessionHelper.addUsersCreated([userNew.id])

    expect(userNew.type).toEqual(UserDtoTypeEnum.Individual)
    expect(userNew.status).toEqual(UserDtoStatusEnum.Valid)

    expect(userNew.name).toEqual(newUserName)
    expect(userNew.nameLast).toBeUndefined()
    expect(userNew.account?.length).toBeGreaterThanOrEqual(1)

    expect(userNew.id).toBeGreaterThan(0)

    expect(userNew.status).toEqual(UserDtoStatusEnum.Valid)
    expect(userNew.type).toEqual(UserDtoTypeEnum.Individual)

    expect(userNew.account).toBeDefined()
    expect(userNew.account.length).toEqual(1)
    expect(userNew.account[0].type).toEqual(UserAccountDtoTypeEnum.Email)
    expect(userNew.account[0].identifier).toEqual(newUserEmail)
    expect(userNew.account[0].status).toEqual(UserAccountDtoStatusEnum.Enabled)
  })

  it(`should Get the newly created user by its ID`, async () => {
    const userGetResult = await apiService.apis.users
      .getUserById({
        id: userNew.id,
      })
      .catch(async (err): Promise<UserDto> => {
        const errBody = await err.response?.json()
        logger.error(
          `Failed to search User by Account: ${err.stack ? err.stack : err} \nResponse: ${JSON.stringify(errBody)}`,
        )
        expect(err).toBeUndefined()
        return undefined
      })
    expect(userGetResult).toBeDefined()
    expect(userGetResult.id).toEqual(userNew.id)
    expect(userGetResult.account).toBeDefined()
    expect(userGetResult.account.length).toEqual(1)
    expect(userGetResult.account[0].type).toEqual(UserAccountDtoTypeEnum.Email)
    expect(userGetResult.account[0].identifier).toEqual(newUserEmail)
    expect(userGetResult.account[0].status).toEqual(UserAccountDtoStatusEnum.Enabled)
  })

  it(`should Search for an existing user by its account`, async () => {
    const result = await apiService.apis.users
      .searchUsers({
        userSearchFilterDto: {
          user: [
            {
              accountRef: {
                identifier: newUserEmail,
                type: UserAccountNewDtoTypeEnum.Email,
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

  it(`should prevent Creating a New User with an already registered email`, async () => {
    expect(userNew).toBeDefined()

    await expect(
      apiService.apis.users.createUser({
        userNewDto: {
          name: newUserName,
          account: [
            {
              identifier: newUserEmail,
              type: UserAccountNewDtoTypeEnum.Email,
            },
          ],
        },
      }),
    ).rejects.toThrow()
  })

  // it(`Get New User w/ non-registered Account`, async () => {
  //   // unexisting test account
  //   const user = await apiService.apis.users
  //     .getUserByAccount({
  //       userAccountIdDto: {
  //         identifier: newUserWalletAddr,
  //         type: UserAccountDtoTypeEnum.Wallet,
  //       },
  //     })
  //     .catch(async (err): Promise<UserDto> => {
  //       const { errMsg } = await extractErrorMsg(err)
  //       logger.info(
  //         `Expected failure to get User from an unknown Account: \n${errMsg}`,
  //       )
  //       expect(err).toBeDefined()
  //       return undefined
  //     })
  //   expect(user).toBeUndefined()
  // })

  // it(`Get New User w/ registered Account`, async () => {
  //   const user = await apiService.apis.users
  //     .getUserByAccount({
  //       userAccountIdDto: {
  //         identifier: newUserWalletAddr,
  //         type: UserAccountDtoTypeEnum.Wallet,
  //       },
  //     })
  //     .catch(async (err): Promise<UserDto> => {
  //       const { errMsg } = await extractErrorMsg(err)
  //       logger.error(
  //         `Expected failure to get User from an unknown Account: \n${errMsg}`,
  //       )
  //       expect(err).toBeUndefined()
  //       return undefined
  //     })
  //   expect(user).toBeDefined()
  //   expect(user.id).toEqual(userNew.id)
  // })
})
