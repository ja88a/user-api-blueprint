import {
  EUserStatus,
  EUserType,
  TUserAccount,
  TUserAccountIdentifier,
  TUserAccountNew,
} from '.'

/**
 * Supported means to identify a user.
 *
 * The specification of an `id` prevails on other specified fields' value, then an email, last a wallet address
 */
export type TUserIdentifier = {
  /** User unique internal ID
   * @example 35 */
  id?: number

  /** User account identifier */
  accountRef?: TUserAccountIdentifier
}

/**
 * New User entity
 */
export type TUserNew = {
  /** User name info
   * @example "Jane" */
  name?: string

  /** Optional user last / family name
   * @example "Smith" */
  nameLast?: string

  /** Type of user profile
   * @example EUserType.INDIVIDUAL */
  type?: EUserType

  /** User sub-accounts */
  account: TUserAccountNew[]
}

/**
 * User entity / data model
 */
export type TUser = TUserNew & {
  /** User unique internal ID
   * @example 35 */
  id: number

  /** User profile general status
   * @example "valid" */
  status: EUserStatus

  /** User unique handle
   * @example "jane#7128" */
  handle: string

  /** User name info
   * @example "Jane" */
  name: string

  /** Type of user profile
   * @example EUserType.INDIVIDUAL */
  type: EUserType

  /** User sub-accounts */
  account: TUserAccount[]

  /** Last time the user info were updated
   * @example "2025-11-14T12:00:00Z" */
  updatedAt?: Date

  /** User creation timestamp
   * @example "2025-07-19T12:00:00Z" */
  createdAt?: Date
}
