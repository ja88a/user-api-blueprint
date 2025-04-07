import { ESubEntityDataset } from './entity-subs.interface'

export interface IRequestContext {
  /** Request correlation ID */
  requestId?: string

  /** Requesting user */
  userId: number

  /** Target user */
  targetUserId?: number

  /** Execution flow */
  flow?: string

  /** Target blockchain */
  blockchainId?: number

  /** Scoping of requested sub-entity data sets */
  subEntities?: ESubEntityDataset[]
}
