import {
  ResponseError,
  UserAccountDtoTypeEnum,
  UserDto,
  UserSearchResultDto,
} from '@jabba01/tuba-api-client-aio'
import { ApiService } from './ApiClient.helper'
import { TestSessionHelper } from './TestSession.helper'
import { logger as loggerW } from '@jabba01/tuba-lib-utils-common'
import { USER_TEST_DEFAULT_ACCOUNT_ADDR } from './Test.constant'

const logContext = 'UserSearch-E2E_Test'
const logger = loggerW.child({ context: logContext })

describe('User Search/Removal (e2e)', () => {
  const apiService = new ApiService()
  const sessionHelper = new TestSessionHelper()

  beforeAll(async () => {
    await sessionHelper.initApiService(apiService)
  })

  beforeEach(async () => {})

  afterAll(async () => {
    await Promise.all([
      sessionHelper.removeUsersCreated(),
      // sessionHelper.removeCreatedMarkets(),
    ]).catch((err) => {
      logger.error(`Failed to remove created entities: ${err.stack ?? err}`)
    })
  })

  // ==========================================================================

  it(`should search for an existing user by its account`, async () => {
    const result = await apiService.apis.users
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
    const result = await apiService.apis.users
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
