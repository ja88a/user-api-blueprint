import { IConflict } from '@jabba01/tuba-lib-utils-data'
import { EUserAccountType } from '../data/user-constants'
import { TUser, TUserNew } from '../data/user.entity'
import { TUserAccount, TUserAccountNew } from '../data/user-account.entity'

/**
 * Data storage service interface for the Users Management domain
 */
export interface IUserDatastoreService {
  /**
   * Check the connection to the database
   * @returns A string indicating the connection status
   */
  testDbConnection(): Promise<string>

  /**
   * Get all users
   * @returns An array of user objects
   */
  retrieveUserAll(): Promise<TUser[]>

  /**
   * Get a user by its ID
   * @param id The ID of the user
   * @returns The found user dataset
   */
  retrieveUserById(id: number): Promise<TUser>

  /**
   * Retrieve users by their IDs
   * @param ids The IDs of the users
   * @returns An array of user objects
   */
  retrieveUsersById(ids: number[]): Promise<TUser[]>

  /**
   * Check for any conflicts in the user data against already stored users
   * @param user The user data to check
   * @returns An array of conflicts, if any
   */
  checkUserFieldsUniqueness(user: TUser): Promise<IConflict[]>

  // == User Sub-Accounts

  /**
   * Retrieve users by their account identifier
   * @param identifier The account identifier
   * @param accountType The type of the account
   * @returns An array of user objects
   */
  retrieveUserByAccountIdentifier(
    identifier: string,
    accountType: EUserAccountType,
  ): Promise<TUser[]>

  /**
   * Check for any conflicts in the user account data against already stored user accounts
   * @param userId target user ID, can be `undefined` for a new user
   * @param account Sub-account data to check
   * @returns An array of conflicts, if any
   */
  checkUserAccountFieldsUniqueness(
    userId: number,
    account: TUserAccount,
  ): Promise<IConflict[]>

  /**
   * Retrieve a user sub-account from its identifier & type
   * @param userId The ID of the user
   * @param type The type of the account
   * @param identifier The account identifier
   * @returns The user account object
   */
  retrieveUserAccountByIdentifier(
    userId: number,
    type: EUserAccountType,
    identifier: string,
  ): Promise<TUserAccount>

  // ========================================================================
  //
  // WRITE Methods
  //

  /**
   * Store in database: create or update a user.
   *
   * For creating a new user entry, the `id` field is not set.
   *
   * @param user The user data to store
   * @returns The stored user object
   */
  storeUser(user: TUserNew & { id?: number }): Promise<TUser>

  /**
   * Remove a user from the database
   * @param userId The ID of the user to remove
   * @returns The removed user dataset
   */
  deleteUser(userId: number): Promise<TUser>

  // == User Sub-Accounts

  /**
   * Store in database: create or update a user sub-account.
   *
   * For creating a new user account entry, the `id` field is not set.
   *
   * @param userId The ID of the user
   * @param newAccount The new account data to store
   * @returns The stored user sub-account dataset
   */
  storeUserAccount(
    userId: number,
    newAccount: TUserAccountNew & { id?: number },
  ): Promise<TUserAccount>

  /**
   * Remove a user sub-account from the database
   * @param userId The ID of the user
   * @param accountId The ID of the account to remove
   * @returns The removed user account dataset
   */
  deleteUserAccount(accountId: number): Promise<TUserAccount>
}
