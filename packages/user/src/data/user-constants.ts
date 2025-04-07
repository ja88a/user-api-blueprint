import { ESubEntityDataset } from '@jabba01/tuba-lib-utils-data'

export const API_TAG_USERS = 'Users'

export enum EUserConflictType {
  USER_NAME = 'user-name',
  USER_HANDLE = 'user-handle',
}

/**
 * Supported user profile statuses
 */
export enum EUserStatus {
  VALID = 'valid',
  BLOCKED = 'blocked',
  PENDING = 'pending',
  UNKNOWN = 'unknown',
}

/** Default user status */
export const UserStatusDefault = EUserStatus.VALID

/** Default email domain set for users having no email address set [yet] */
export const USER_EMAIL_DEFAULT_DOMAIN = 'setyouremail.now'

/** All available sub-entities data sets for Users */
export const UserSubEntitiesAll = [
  ESubEntityDataset.USER_INFO,
  ESubEntityDataset.USER_ACCOUNT,
]

/**
 * Type of user operation flow
 */
export enum EUserFlow {
  /** User registration flow */
  AUTHENTICATE = 'authenticate',

  /** User registration flow */
  REGISTER = 'register',

  /** User info retrieval flow */
  RETRIEVE = 'retrieve',

  /** User info update flow */
  UPDATE = 'update',

  /** Change a user sub-account(s) */
  UPDATE_ACCOUNT = 'account-update',

  /** User deletion flow */
  DELETE = 'delete',
}

/** Supported types of user profile */
export enum EUserType {
  /** Individual user */
  INDIVIDUAL = 'individual',

  /** Business user */
  BUSINESS = 'business',
}

/** Default user type, e.g. used when not specified */
export const UserTypeDefault = EUserType.INDIVIDUAL

/** User Account supported statuses */
export enum EUserAccountStatus {
  /** Active account, enabled */
  ENABLED = 'enabled',
  /** Inactive account, disabled */
  DISABLED = 'disabled',
  /** Account blocked */
  BLOCKED = 'blocked',
}

/** Default user account status */
export const UserAccountStatusDefault = EUserAccountStatus.ENABLED

/** Supported user account types.
 *
 * The `identifier` consists in a chain specific account address */
export enum EUserAccountType {
  /** EOA. Crypto wallet account */
  WALLET = 'wallet',

  /** Email account.
   *
   * The `identifier` consists in an email address */
  EMAIL = 'email',
}

export const USER_NAME_DEFAULT_UNKNOWN_PREFIX = 'u_'