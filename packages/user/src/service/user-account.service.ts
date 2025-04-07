import {
  IConflict,
  IRequestContext
} from '@jabba01/tuba-lib-utils-data'
import {
  BadRequestException,
  InternalServerErrorException,
} from '@jabba01/tuba-lib-utils-ws'
import { Injectable, Logger } from '@nestjs/common'
import {
  EUserAccountType,
  TUser,
  TUserAccount,
  TUserAccountIdentifier,
  TUserAccountNew,
  TUserIdentifier,
  UserAccountStatusDefault
} from '../data'
import { UserDatastoreService } from '../database'
import { UserService } from './user.service'

@Injectable()
export class UserAccountService {
  constructor(
    private readonly userService: UserService,
    private readonly datastore: UserDatastoreService,
    private readonly logger: Logger,
  ) {}

  /**
   * Extract the user IDs from the user role grant request.
   * 
   * If the user ID is not provided, the account address is used to retrieve the user ID.
   * If the user does not exist, a new dummy/default user is created in the User domain.
   *
   * @param userIdentifier
   * @returns the user ID and its main account address
   */
  async findOrCreateUserWithWalletAccount(
    userIdentifier: TUserIdentifier,
    context: IRequestContext,
  ): Promise<TUser> {
    if (!userIdentifier) {
      throw BadRequestException.INVALID_INPUT(
        `User Lookup aborted - No user identifier provided`,
      )
    }

    // Look up for the target user
    const userTarget = await this.userService.getUser(userIdentifier, context).catch((err) => {
      throw BadRequestException.INVALID_INPUT(
        `User Lookup aborted - Failed to search for user with identifier '${JSON.stringify(userIdentifier)}'`,
        err,
      )
    })

    if (userTarget) {
      // User exists
      return userTarget
    } else {
      // User not found
      if (userIdentifier.id > 0)
        throw BadRequestException.RESOURCE_NOT_FOUND(
          `User with ID '${userIdentifier.id}' not found - User role granting process aborted`,
        )
      if (
        !(
          userIdentifier.accountRef?.type === EUserAccountType.WALLET &&
          userIdentifier.accountRef?.identifier?.length > 0
        )
      )
        throw BadRequestException.INVALID_INPUT(
          `User Find or Create process aborted - No user ID nor a valid wallet account provided. Submitted: ${JSON.stringify(userIdentifier)}`,
        )

      // Create a new dummy user account based on the communicated wallet address only
      // TODO @User account reconciliation on users' web2 signup
      return await this.userService.createUser(
        {
          account: [
            {
              identifier: userIdentifier.accountRef.identifier,
              type: EUserAccountType.WALLET,
            },
          ],
        },
        context,
      ).catch((err) => {
        throw InternalServerErrorException.INTERNAL_SERVER_ERROR(
          `Failed to create new User from sub-account '${JSON.stringify(userIdentifier.accountRef)}'`,
          err,
        )
      })
    }
  }

  /**
   * Inject the user IDs from the provided user account identifiers.
   *
   * Method is NOT Pure: This method modifies the input user account identifiers by adding the user ID if it is not already set.
   *
   * @param userId ID of the target user
   * @param userAccounts the account info
   * @returns
   */
  async injectUserAccountIds(
    userId: number,
    userAccounts: TUserAccountIdentifier[],
  ): Promise<void[]> {
    if (!(userAccounts?.length > 0))
      throw BadRequestException.INVALID_INPUT(`No user account info provided`)

    return await Promise.all(
      userAccounts.map(async (acc) => {
        if (acc.id) return
        if (!(acc.identifier && acc.type))
          throw BadRequestException.INVALID_INPUT(
            `Inject User Account IDs aborted - Invalid account identifier '${JSON.stringify(acc)}'`,
          )
        return this.datastore
          .retrieveUserAccountByIdentifier(userId, acc.type, acc.identifier)
          .then((userAccount) => {
            if (userAccount) acc.id = userAccount.id
            else
              throw BadRequestException.RESOURCE_NOT_FOUND(
                `Failed to retrieve User Account ID - No User Account found with identifier '${acc.identifier}' of type '${acc.type}'`,
              )
          })
      }),
    )
  }

  /**
   * Validate the user account fields
   * @param userId ID of the target user
   * @param userAccount the account info
   * @returns a report on problematic fields
   */
  async validateUserAccount(
    userId: number,
    userAccount: TUserAccountNew,
    context: IRequestContext,
  ): Promise<IConflict[]> {
    if (!userAccount)
      throw BadRequestException.INVALID_INPUT(
        `User account validation aborted - No user account info provided`,
      )

    if (!(userAccount.identifier?.length > 0))
      throw BadRequestException.INVALID_INPUT(
        `User account validation aborted - Invalid account identifier '${JSON.stringify(userAccount.identifier)}'`,
      )
    if (!Object.values(EUserAccountType).find((v) => userAccount.type === v))
      throw BadRequestException.INVALID_INPUT(
        `User Account validation aborted - Invalid account type '${userAccount.type}'`,
      )

    // Check that the sub-account is not already associated to another user
    const existingUser = await this.userService.getUserBySubAccount(
      { identifier: userAccount.identifier, type: userAccount.type },
      context,
    )
    if (existingUser?.id > 0 && existingUser.id !== userId)
      throw BadRequestException.RESOURCE_ALREADY_EXISTS(
        `User Account validation aborted - Account with identifier '${userAccount.identifier}' of type '${userAccount.type}' already associated to user '${existingUser.id}'`,
      )

    const conflicts = await this.datastore
      .checkUserAccountFieldsUniqueness(userId, userAccount as TUserAccount)
      .catch((err) => {
        throw InternalServerErrorException.UNEXPECTED_ERROR(
          `Failed to validate user account '${JSON.stringify(userAccount)}' \n${err}`,
          err,
        )
      })

    if (conflicts?.length > 0)
      this.logger.log(
        `Conflicts found for validating User Account with identifier '${userAccount.identifier}': ${JSON.stringify(conflicts)}`,
      )

    return conflicts
  }

  /**
   * Add a new account to an existing user
   *
   * Possible user account types:
   * - `EMAIL`: email address
   * - `WALLET`: crypto wallet address
   * - `SOCIAL`: social media account
   *
   * @param userId ID of the target user
   * @param account the account info to add
   * @returns ID of the added account
   */
  async addUserAccount(
    userRef: TUserIdentifier,
    account: TUserAccountNew,
    context: IRequestContext,
  ): Promise<TUserAccount> {
    // Validate
    if (!userRef || !account)
      throw BadRequestException.INVALID_INPUT(
        `Add user account aborted - No user or account info provided. User '${JSON.stringify(userRef)}' - Account '${JSON.stringify(account)}'`,
      )

    await this.userService.injectUserIds([userRef], context)

    const userId = userRef.id
    if (!(userId > 0))
      throw BadRequestException.INVALID_INPUT(
        `Add User Account aborted - Invalid user ID '${userId}'`,
      )

    const user = await this.userService.getUserById(userId, context)
    if (!user)
      throw BadRequestException.RESOURCE_NOT_FOUND(
        `Addition of user account aborted - User with ID '${userId}' not found`,
      )

    const existingAccount = user.account.find(
      (acc) => acc.identifier === account.identifier && acc.type === account.type,
    )
    if (existingAccount) {
      this.logger.warn(
        `Addition of user account aborted - Account of type '${account.type}' with identifier '${account.identifier}' already registered for user '${userId}'`,
      )
      return existingAccount as TUserAccount
    }

    const conflicts = await this.validateUserAccount(userId, account, context)
    if (conflicts.length > 0)
      throw BadRequestException.RESOURCE_ALREADY_EXISTS(
        `Failed to validate - New user account creation aborted due to conflicts: ${JSON.stringify(conflicts)}`,
      )

    // Check if to set the new account as default
    const isDefaultAccount =
      account.default ||
      !user.account.find((acc) => acc.type === account.type && acc.default)

    // Store the new account
    const newUserAccount = {
      ...account,
      id: undefined as number,
      status: UserAccountStatusDefault,
      default: isDefaultAccount,
    } satisfies TUserAccount

    const addedAccount = await this.datastore
      .storeUserAccount(userId, newUserAccount)
      .catch((err) => {
        throw InternalServerErrorException.UNEXPECTED_ERROR(
          `Add user account aborted - Failed to add account '${JSON.stringify(newUserAccount)}' to user '${userId}' \n${err}`,
        )
      })

    return addedAccount
  }

  /**
   * Remove an account associated to an existing user
   *
   * @param userId ID of the target user
   * @param accountId ID of the account to remove
   * @returns the added accounts
   */
  async addUserAccounts(
    userRef: TUserIdentifier,
    accounts: TUserAccountNew[],
    context: IRequestContext,
  ): Promise<TUserAccount[]> {
    if (!userRef || !(accounts?.length > 0))
      throw BadRequestException.INVALID_INPUT(
        `Add user accounts aborted - No user or account info provided. User '${JSON.stringify(userRef)}' - Accounts '${JSON.stringify(accounts)}'`,
      )

    return await Promise.all(
      accounts.map((account) => this.addUserAccount(userRef, account, context)),
    ).catch((err) => {
      if (err instanceof BadRequestException) throw err
      throw InternalServerErrorException.UNEXPECTED_ERROR(
        `Failed to add accounts '${JSON.stringify(accounts)}' to user '${JSON.stringify(userRef)}'`,
        err,
      )
    })
  }

  /**
   * Remove an account associated to an existing user
   *
   * @param userId ID of the target user
   * @param accountId ID of the account to remove
   * @returns Identifier of the removed account
   */
  async removeUserAccount(
    userRef: TUserIdentifier,
    accountRef: TUserAccountIdentifier,
    context: IRequestContext,
  ): Promise<TUserAccount> {
    if (!userRef || !accountRef)
      throw BadRequestException.INVALID_INPUT(
        `Remove user account aborted - No user or account info provided. User '${JSON.stringify(userRef)}' - Account '${JSON.stringify(accountRef)}'`,
      )

    await this.userService.injectUserIds([userRef], context)
    const userId = userRef.id
    if (!(userId > 0))
      throw BadRequestException.INVALID_INPUT(
        `Remove User Account aborted - Invalid user ID '${userId}'`,
      )

    await this.injectUserAccountIds(userId, [accountRef])
    const accountId = accountRef.id
    if (!(accountId > 0))
      throw BadRequestException.INVALID_INPUT(
        `Remove user account aborted - Invalid account ID '${accountId}'`,
      )

    const removedAccount = await this.datastore
      .deleteUserAccount(accountId)
      .catch((err) => {
        throw InternalServerErrorException.UNEXPECTED_ERROR(
          `Remove user account aborted - Failed to remove account '${accountId}' from user '${userId}' \n${err}`,
        )
      })

    return removedAccount
  }
}
