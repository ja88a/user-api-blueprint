/**
 * Supported conflict types for the web services
 */
export enum EConflictType {
  EXIST = 'ALREADY_EXIST',

  DB_VALUE_UNIQUE = 'DB_VALUE_UNIQUE',
}

export const ConflictTypeDefault = EConflictType.DB_VALUE_UNIQUE

/**
 * A conflict reported by the datastore
 */
export interface IConflict {
  /** ID of the existing entry & conflict's root cause, e.g. a DB entry ID
   * @example 1234567890 */
  id?: string

  /** Field or service name for mapping the root cause of the conflict
   * @example 'account-identifier' */
  name: string

  /** Type of conflict
   * @example 'DB_VALUE_UNIQUE' */
  type: EConflictType
}
