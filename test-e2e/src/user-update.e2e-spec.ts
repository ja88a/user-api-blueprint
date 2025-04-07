import {
  UserDto,
  UserDtoStatusEnum,
  UserDtoTypeEnum,
} from '@jabba01/tuba-api-client-aio'
import { ApiService } from './ApiClient.helper'
import { TestSessionHelper } from './TestSession.helper'
import { logger as loggerW } from '@jabba01/tuba-lib-utils-common'
import { extractErrorMsg } from './TestUtils'

const logContext = 'UserUpdate-E2E_Test'
const logger = loggerW.child({ context: logContext })

describe('User Update (e2e)', () => {
  const apiService = new ApiService()
  const sessionHelper = new TestSessionHelper()

  let userTest: UserDto
  let userInfoInitial: UserDto
  // let userNew: UserDto
  // const newUserName = 'Test User ' + new Date().toISOString()
  // const newUserEmail = 'test.user@fake.com'

  beforeAll(async () => {
    await sessionHelper.initApiService(apiService)
  })

  beforeEach(async () => {})

  afterAll(async () => {
    await Promise.all([sessionHelper.removeUsersCreated()]).catch((err) => {
      logger.error(`Failed to remove created entities: ${err.stack ?? err}`)
    })
  })

  // ==========================================================================

  /**
   * Get Existing User by Account
   */
  it(`Get Existing User by Account`, async () => {
    expect(userTest?.id).toBeGreaterThan(0)

    userInfoInitial = await apiService.apis.users.getUserCurrent()

    expect(userInfoInitial).toBeDefined()
    expect(userInfoInitial.id).toBeGreaterThan(0)
    expect(userInfoInitial.id).toEqual(userTest.id)
    expect(userInfoInitial.account).toEqual(userTest.account)

    expect(userInfoInitial.type).toEqual(UserDtoTypeEnum.Individual)
    expect(userInfoInitial.status).toEqual(UserDtoStatusEnum.Valid)

    expect(userInfoInitial.name).toEqual(userTest.name)
    expect(userInfoInitial.name?.length).toBeGreaterThan(0)
    expect(userInfoInitial.nameLast).toEqual(userTest.nameLast)
    expect(userInfoInitial.nameLast).toBeUndefined()
  })

  /**
   * Update current user names & type
   */
  it(`should Update1 the user`, async () => {
    const newName = 'Jane'
    const newNameLast = 'Doe'

    const userUpdate = await apiService.apis.users
      .updateUserPartial({
        id: userTest.id,
        userUpdDto: {
          name: newName,
          nameLast: newNameLast,
          type: UserDtoTypeEnum.Business,
        },
      })
      .catch(async (err): Promise<UserDto> => {
        const { errMsg } = await extractErrorMsg(err)
        logger.error(`Failed to update current Test User \n${errMsg}`)
        return null
      })

    expect(userUpdate).toBeDefined()
    expect(userUpdate.id).toBeGreaterThan(0)
    expect(userUpdate.id).toEqual(userTest.id)

    expect(userUpdate.id).toEqual(userTest.id)

    expect(userUpdate.account).toBeDefined()
    expect(userUpdate.account).toEqual(userTest.account)

    expect(userUpdate.type).toEqual(UserDtoTypeEnum.Business)
    expect(userUpdate.status).toEqual(UserDtoStatusEnum.Valid)

    expect(userUpdate.name).toEqual(newName)
    expect(userUpdate.nameLast).toEqual(newNameLast)
    //expect(userUpdate.nameLast).toEqual(userInfoInitial.nameLast)
  })

  /**
   * Update current user names & type
   */
  it(`should Update2 the user`, async () => {
    const userUpdate = await apiService.apis.users
      .updateUserPartial({
        id: userTest.id,
        userUpdDto: {
          ...userInfoInitial,
        },
      })
      .catch(async (err): Promise<UserDto> => {
        const { errMsg } = await extractErrorMsg(err)
        logger.error(`Failed to update current Test User \n${errMsg}`)
        return null
      })

    expect(userUpdate).toBeDefined()
    expect(userUpdate.id).toBeGreaterThan(0)
    expect(userUpdate.id).toEqual(userTest.id)

    expect(userUpdate.id).toEqual(userTest.id)

    expect(userUpdate.account).toBeDefined()
    expect(userUpdate.account).toEqual(userTest.account)

    expect(userUpdate.type).toEqual(userInfoInitial.type)
    expect(userUpdate.status).toEqual(userInfoInitial.status)

    expect(userUpdate.name).toEqual(userInfoInitial.name)
    expect(userUpdate.nameLast).toEqual(userInfoInitial.nameLast)
  })
})
