import { EUserAccountStatus, EUserAccountType } from "./user-constants"

/**
 * Supported means to identify a user account.
 *
 * Either the account `id` OR the `identifier` & `type` fields must be set.
 */
export type TUserAccountIdentifier = {
  /** User account unique internal ID.
   *
   * Alternative to specifying the `identifier` & `type` fields.
   * @example 35 */
  id?: number

  /** User account unique identifier. Its type of value depends on the account type.
   * @example '0xC8ed59E38A779E34eE5E75A744DC6C48B7830b03' */
  identifier?: string

  /** Type of account
   * @example "wallet" */
  type?: EUserAccountType
}

/**
 * New User Account
 */
export type TUserAccountNew = {
  /** Type of account
   * @example "wallet" */
  type: EUserAccountType

  /** Sub-type of the account, if applicable.
   * @example 'EVM' */
  subType?: string

  /** User account unique identifier.
   * Unique address for a user account of type email or crypto wallet, social network handle, etc
   * @example '0xC8ed59E38A779E34eE5E75A744DC6C48B7830b03' */
  identifier: string

  /** User account name
   * @example "EVM DeFi account #1" */
  name?: string

  /** Specify if this is this the default account for the given type of account.
   * Only one account of a given type can be set as default.
   * @example true */
  default?: boolean

  /** If the user account has been verified, then this field is populated
   * with the last verification date & time.
   *
   * @example "2024-11-14T06:32:000Z" */
  verified?: Date
}

/**
 * User Account
 */
export type TUserAccount = TUserAccountNew & {
  /** Account unique internal ID
   * @example 35 */
  id: number

  /** Account status
   * @example "active" */
  status: EUserAccountStatus

  /** Last changed date & time
   * @example "2024-11-14T06:32:000Z" */
  updatedAt?: Date

  /** Account creation date & time
   * @example "2017-11-14T06:00:000Z" */
  createdAt?: Date
}
