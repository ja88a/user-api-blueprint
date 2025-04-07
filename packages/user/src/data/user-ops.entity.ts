import { ESubEntityDataset } from '@jabba01/tuba-lib-utils-data'
import { TUser, TUserIdentifier } from './user.entity'

/**
 * Filter options to search for users.
 *
 * At least a `project` or a `market` filter must be specified, alternatively a `user`.
 *
 * Defining the `blockchain` filter enables to limit the scope of the market projects search.
 */
export type TUserSearchFilter = {
  /** Reference(s) to users to search for, via their ID or associated account(s) */
  user: TUserIdentifier[]

  /** Options for including extended info about users. */
  subEntities?: ESubEntityDataset[]
}

/**
 * Results of a search request for projects
 */
export type TUserSearchResult = {
  /** Found User(s) info matching the search criteria */
  user: TUser[]
}
