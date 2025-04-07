import {
  UserDto
} from '@jabba01/tuba-api-client-aio'
import { logger as loggerW } from '@jabba01/tuba-lib-utils-common'
import { ApiService } from './ApiClient.helper'
import { extractErrorMsg } from './TestUtils'

const logger = loggerW.child({ context: 'TestSessionHelper' })

export class TestSessionHelper {
  createdUserIds: number[] = []

  apiService: ApiService

  /**
   * Init the ApiService instance with optional user authentication.
   *
   * @param apiService optional ApiService instance to reuse
   * @param doNotAuthenticate optional flag to skip the default user authentication
   * @param userCreds optional user credentials specification to use for authentication
   * @returns
   */
  async initApiService(
    apiService: ApiService,
  ): Promise<void> {
    logger.debug(`${apiService ? 'Reusing' : 'Creating'} ApiService`)

    if (apiService) this.apiService = apiService
    else apiService = new ApiService()
  }

  // ==========================================================================
  //
  // User
  //

  async getUserCurrent(): Promise<UserDto> {
    const user = await this.apiService.apis.users
      .getUserCurrent()
      .catch(async (err) => {
        const msg = await err.response?.json()
        throw new Error(
          `Failed to get current user - Response: '${msg}' \n${err.stack ? err.stack : err}`,
        )
      })
    return user
  }

  addUsersCreated(ids: number[]): number[] {
    if (!ids || ids.length === 0) return this.createdUserIds
    ids.forEach((id) => {
      if (id && !this.createdUserIds.includes(id)) this.createdUserIds.push(id)
    })
    return this.createdUserIds
  }

  async removeUsersCreated(): Promise<number[]> {
    if (!(this.createdUserIds?.length > 0)) return this.createdUserIds

    const ids = this.createdUserIds
    if (!ids || ids.length === 0) return ids

    logger.debug(`Removing created Users: '${this.createdUserIds}'`)

    while (this.createdUserIds.length > 0) {
      const userId = this.createdUserIds.pop()
      if (!userId) break

      const result = await this.apiService.apis.users
        .deleteUser({
          id: userId,
        })
        .catch(async (err) => {
          const { errMsg } = await extractErrorMsg(err)
          throw new Error(
            `removeCreatedUsers - Failed to delete user '${userId}' \n${errMsg}`,
          )
        })
      expect(result).toBeDefined()
      expect(result.id).toBe(userId)
    }

    if (this.createdUserIds.length > 0) {
      logger.error(
        `removeCreatedUsers - Failed to remove all users, leftovers: ${this.createdUserIds}`,
      )
    }
    expect(this.createdUserIds.length).toBe(0)
    return this.createdUserIds
  }
}
