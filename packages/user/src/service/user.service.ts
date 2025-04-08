import {
  EHealthStatus,
  EServiceName,
  ESubService,
  IConflict,
  IHealthStatus,
  IRequestContext,
} from '@jabba01/tuba-lib-utils-data'
import {
  BadRequestException,
  InternalServerErrorException,
} from '@jabba01/tuba-lib-utils-ws'
import { Injectable, Logger } from '@nestjs/common'
import { exit } from 'node:process'
import {
  computeUserHandle,
  computeUserNameDefault,
  EUserConflictType,
  EUserFlow,
  TUser,
  TUserAccount,
  TUserAccountIdentifier,
  TUserIdentifier,
  TUserNew,
  TUserSearchFilter,
  UserAccountStatusDefault,
  UserStatusDefault,
  UserTypeDefault,
} from '../data'
import { UserDatastoreService } from '../database'

@Injectable()
export class UserService {
  constructor(
    private readonly datastore: UserDatastoreService,
    private readonly logger: Logger,
  ) {}

  /**
   * Retrieve the service status
   * @param exitOnErrors Optional whitelist of sub-services exiting the process if they report an error
   * @returns service status information
   */
  async getStatus(exitOnErrors?: ESubService[]): Promise<IHealthStatus> {
    let statusOk = true
    const subServices: IHealthStatus[] = []
    await this.datastore
      .testDbConnection()
      .then((date) => {
        subServices.push({
          name: ESubService.DATASTORE,
          status: EHealthStatus.OK,
          info: date,
        })
      })
      .catch((err) => {
        subServices.push({
          name: ESubService.DATASTORE,
          status: EHealthStatus.ERROR,
          info: `${err}`,
        })
        statusOk = false
      })

    if (exitOnErrors?.length > 0 && !statusOk) {
      if (
        subServices.filter(
          (service) =>
            service.status === EHealthStatus.ERROR &&
            exitOnErrors.includes(
              Object.values(ESubService).find((v) => service.name === v),
            ),
        ).length > 0
      ) {
        this.logger.fatal(
          `Exiting Service on health check errors '${JSON.stringify(subServices)}'`,
        )
        exit(1)
      }
    }

    return {
      name: EServiceName.USERS,
      status: statusOk ? EHealthStatus.OK : EHealthStatus.ERROR,
      services: subServices,
    }
  }

  async getAllUsers(context: IRequestContext): Promise<TUser[]> {
    const users = await this.datastore.retrieveUserAll().catch((err: unknown) => {
      throw InternalServerErrorException.UNEXPECTED_ERROR(
        `Failed to retrieve all users from datastore - Context: '${JSON.stringify(context)}' \n${err}`,
        err,
      )
    })
    if (!users || users.length == 0)
      this.logger.warn(`No users found - Empty data store!`)
    return users
  }

  async getUserById(id: number, context: IRequestContext): Promise<TUser> {
    const user = await this.datastore.retrieveUserById(id)
    if (!user) {
      this.logger.warn(
        `User with id '${id}' not found in datastore - Context: '${JSON.stringify(context)}'`,
      )
    }
    return user
  }

  async getUsersById(ids: number[], context: IRequestContext): Promise<TUser[]> {
    const users = await this.datastore.retrieveUsersById(ids)
    if (!(users?.length > 0)) {
      this.logger.warn(
        `No users found for IDs '${ids}' - Context: '${JSON.stringify(context)}'`,
      )
    }
    if (users.length < ids.length) {
      this.logger.warn(
        `Only '${users.length}' users found out of '${ids.length}'. Submitted: '${ids}' - Context: '${JSON.stringify(context)}'`,
      )
    }
    return users
  }

  /**
   * Retrieve the user information based on the provided user identifier.
   *
   * The user ID is prioritized over the user account-based identifications.
   *
   * @param userRef the user identifier
   * @returns the user info
   */
  async getUser(userRef: TUserIdentifier, context: IRequestContext): Promise<TUser> {
    if (userRef.id > 0) return await this.getUserById(userRef.id, context)
    else if (userRef.accountRef)
      return await this.getUserBySubAccount(userRef.accountRef, context)
    else {
      throw BadRequestException.INVALID_INPUT(
        `Get user: No relevant user identification info found from '${JSON.stringify(userRef)}' - Context: '${JSON.stringify(context)}'`,
      )
    }
  }

  /**
   * Retrieve a user by its sub-account identifier.
   *
   * @param account user sub-account associated to the user
   * @returns the users info, can be multiple if the sub-account is shared
   */
  async getUserBySubAccount(
    account: TUserAccountIdentifier,
    context: IRequestContext,
  ): Promise<TUser> {
    if (!(account?.identifier && account?.type))
      throw BadRequestException.INVALID_INPUT(
        `Get user by account identifier failed - Invalid account identifier '${JSON.stringify(account)}'`,
      )

    const users = await this.datastore
      .retrieveUserByAccountIdentifier(account.identifier, account.type)
      .catch((err) => {
        throw InternalServerErrorException.UNEXPECTED_ERROR(
          `Failed to retrieve user by account identifier '${account.identifier}' of type '${account.type}' from datastore - Context: '${JSON.stringify(context)}' \n${err}`,
          err,
        )
      })

    if (!(users?.length > 0)) {
      this.logger.warn(
        `No User with account '${account.type}' identifier '${account.identifier}' found in datastore`,
      )
    } else if (users.length > 1) {
      this.logger.error(
        `Multiple users found with account '${account.type}' identifier '${account.identifier}' - Returning first found user '${users[0].id}' out of ${users.length} - Context: '${JSON.stringify(context)}'. Found: '${JSON.stringify(users)}`,
      )
    }

    return users?.[0]
  }

  /**
   * Extract the user IDs from the provided user identifiers, get the information from the data store if required.
   *
   * The order of the provided user identifiers is respected.
   *
   * @param users a set of user identifiers
   * @returns
   */
  async extractUserIds(
    users: TUserIdentifier[],
    context: IRequestContext,
  ): Promise<number[]> {
    if (!users || users.length == 0) throw new Error('No user identifiers specified')

    const userIds = new Array<number>(users.length)
    const cachedUserIds = new Map<string, number>()

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      let userId = user.id
      if (!(userId > 0) && user.accountRef) {
        const cacheKey = user.accountRef.type + '_' + user.accountRef.identifier
        userId = cachedUserIds.get(cacheKey)
        if (!(userId > 0) && userId !== -1) {
          const foundUser = await this.getUserBySubAccount(user.accountRef, context)
          if (foundUser?.id > 0) {
            userId = foundUser.id
            cachedUserIds.set(cacheKey, foundUser.id)
          } else cachedUserIds.set(cacheKey, -1)
        }
      }
      if (userId > 0) userIds[i] = userId
      else {
        userIds[i] = undefined
        this.logger.warn(
          `Failed to extract User ID - No user found with identifier '${JSON.stringify(user)}' - Context: '${JSON.stringify(context)}'`,
        )
      }
    }

    return userIds
  }

  /**
   * Modifies the provided user references by injecting them a user ID if they are not already set.
   *
   * If not provided, the User ID is derived from the submitted user account address. If the latter is
   * neither provided nor found in the DB, an error is thrown.
   *
   * @param userRefs the set of user identifier to potentially modify
   * @returns
   */
  async injectUserIds(
    userRefs: TUserIdentifier[],
    context: IRequestContext,
  ): Promise<void> {
    return await this.extractUserIds(userRefs, context).then((userIds) => {
      if (!(userIds?.length > 0))
        throw BadRequestException.RESOURCE_NOT_FOUND(
          `Users with identifiers '${JSON.stringify(userRefs)}' not found`,
        )
      if (userIds.length !== userRefs.length)
        this.logger.warn(
          `User IDs not found from the submitted user identifiers '${JSON.stringify(userRefs)}': ${userIds}`,
        )
      userRefs.forEach((userRef, index) => {
        userRef.id = userIds[index]
      })
    })
  }

  /**
   *
   * @param userIdentifiers the set of user identifiers, either their ID or their associated wallet account address
   * @returns
   */
  async getUsers(
    userIdentifiers: TUserIdentifier[],
    context: IRequestContext,
  ): Promise<TUser[]> {
    const userIds = await this.extractUserIds(userIdentifiers, context)

    const usersInDB = await this.getUsersById(userIds, context)

    if (usersInDB.length !== userIds.length && context.flow !== EUserFlow.RETRIEVE)
      throw new Error(
        `All specified users have not been found in datastore - Identifiers: '${JSON.stringify(userIdentifiers)}' - Found users: ${JSON.stringify(usersInDB)}`,
      )

    return usersInDB
  }

  /**
   * Search for users based on the provided filter
   * @param filter the search filter
   * @param context the request context
   * @returns
   */
  async searchUsers(
    filter: TUserSearchFilter,
    context: IRequestContext,
  ): Promise<TUser[]> {
    let users: TUser[] = []
    if (filter?.user?.length > 0) users = await this.getUsers(filter.user, context)

    // Avoid returning the same user multiple times
    return users.filter(
      (user, index) => users.findIndex((u) => u.id === user.id) === index,
    )
  }

  /**
   * Confirm from the DB that the user field values are valid: unique in the DB
   * @param user the user info
   * @returns a report on problematic fields
   */
  async validateUser(
    user: TUserNew & { id?: number },
    context: IRequestContext,
  ): Promise<IConflict[]> {
    if (!user)
      throw BadRequestException.INVALID_INPUT(
        `User validation aborted - No user info provided. Context: ${JSON.stringify(context)}`,
      )
    if (!(user.account?.length > 0) && context.flow !== EUserFlow.UPDATE)
      throw BadRequestException.INVALID_INPUT(
        `User validation aborted - No user account info provided. Context: ${JSON.stringify(context)}`,
      )

    const conflicts = await this.datastore
      .checkUserFieldsUniqueness(user as TUser)
      .catch((err) => {
        throw InternalServerErrorException.UNEXPECTED_ERROR(
          `Failed to validate user '${JSON.stringify(user)}' \n${err}`,
          err,
        )
      })
    if (conflicts?.length > 0)
      this.logger.log(
        `Conflicts found for validating User '${user.name}' with account identifiers '${user.account?.map((acc) => acc.identifier)}': ${JSON.stringify(conflicts)}`,
      )

    return conflicts
  }

  /**
   * Create a new user
   *
   * If the user sub-account is already associated to an existing user, the creation is aborted.
   *
   * @param user the new user info
   * @param context the request context
   * @returns the stored user info
   */
  async createUser(user: TUserNew, context: IRequestContext): Promise<TUser> {
    // Check
    if (!user)
      throw BadRequestException.INVALID_INPUT(
        `New user creation aborted - No user info provided. Context: ${JSON.stringify(context)}`,
      )
    if (!(user.account?.length > 0))
      throw BadRequestException.INVALID_INPUT(
        `New user creation aborted - At least one account must be provided '${JSON.stringify(user)}'. Context: ${JSON.stringify(context)}`,
      )

    for (const acc of user.account) {
      const existingUser = await this.getUser({ accountRef: acc }, context)
      if (existingUser?.id > 0) {
        this.logger.warn(
          `New User Creation aborted - A user with sub-account identifier '${user.account[0].identifier}' already exists: '${JSON.stringify(existingUser)}'`,
        )
        throw BadRequestException.RESOURCE_ALREADY_EXISTS(
          `User Creation Aborted - New User sub-account '${JSON.stringify(acc)}' is already associated to an existing user`,
        )
      }
    }

    // Prepare
    const userHandle = computeUserHandle(user)
    const userName = user.name ?? computeUserNameDefault(user.account)
    const newUser: TUser = {
      id: undefined,
      status: UserStatusDefault,
      handle: userHandle,
      name: userName,
      nameLast: user.nameLast,
      type: user.type || UserTypeDefault,
      account: user.account.map(
        (acc) =>
          ({
            ...acc,
            id: undefined as number,
            status: UserAccountStatusDefault,
            default: true,
          }) satisfies TUserAccount,
      ),
    }

    // Validate
    const conflicts = await this.validateUser(newUser, context)
    if (conflicts?.length > 0) {
      if (
        conflicts.length === 1 &&
        conflicts[0].name === EUserConflictType.USER_HANDLE
      ) {
        // Set a different user handle since actual conflicts with another user unique handle
        newUser.handle = computeUserHandle(user)
      } else {
        throw BadRequestException.RESOURCE_ALREADY_EXISTS(
          `Failed to validate - New user creation aborted due to conflicts: ${JSON.stringify(conflicts)}`,
        )
      }
    }

    // Store
    const userStored = await this.datastore.storeUser(newUser).catch((err) => {
      throw InternalServerErrorException.UNEXPECTED_ERROR(
        `New user creation aborted - Failed to store user '${JSON.stringify(newUser)}'`,
        err,
      )
    })

    return userStored
  }

  /**
   * Update an existing user in the DB
   * @param userNewData
   * @param context
   */
  async updateUser(
    userNewData: TUserNew & { id: number },
    context: IRequestContext,
  ): Promise<TUser> {
    if (!(userNewData?.id > 0))
      throw BadRequestException.INVALID_INPUT(
        `User update aborted - Invalid user info provided '${JSON.stringify(userNewData)}'. Context: '${JSON.stringify(context)}'`,
      )

    const userExisting = await this.getUserById(userNewData.id, context)
    if (!userExisting)
      throw BadRequestException.RESOURCE_NOT_FOUND(
        `User update aborted - User with ID '${userNewData.id}' not found`,
      )

    // Merge the new data with the existing user info
    const userMerged = {
      ...userExisting,
      ...userNewData,
    }

    // Validate
    const conflicts = await this.validateUser(userMerged, context)
    if (conflicts?.length > 0)
      throw BadRequestException.RESOURCE_ALREADY_EXISTS(
        `Failed to validate - User update aborted due to conflicts: ${JSON.stringify(conflicts)}`,
      )

    // Store
    const userUpdated = await this.datastore.storeUser(userNewData).catch((err) => {
      throw InternalServerErrorException.UNEXPECTED_ERROR(
        `User update aborted - Failed to update user '${JSON.stringify(userMerged)}'`,
        err,
      )
    })

    this.logger.warn(
      `Updated info of User '${userNewData.id}' to '${JSON.stringify(userUpdated)}'`,
    )

    return userUpdated
  }

  /**
   * Delete an existing user from the DB
   * @param user the user info
   * @returns the updated user's ID
   */
  async deleteUser(userId: number, context: IRequestContext): Promise<TUser> {
    if (!(userId > 0))
      throw BadRequestException.INVALID_INPUT(
        `User deletion aborted - Invalid user ID '${userId}' - Context: '${JSON.stringify(context)}'`,
      )

    const removedUserInfo = await this.datastore.deleteUser(userId).catch((err) => {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(
        `User deletion aborted - Failed to delete user '${userId}' \n${err}`,
        err,
      )
    })

    this.logger.warn(
      `User '${userId}' deleted by '${context.userId}': ${JSON.stringify(removedUserInfo)}`,
    )
    return removedUserInfo
  }

  // ========================================================================
  //
  // User Sub-Accounts management
  //
}
