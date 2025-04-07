import { Request } from 'express'

export interface IAccessTokenPayload {
  /** User authentication ID */
  sub: number

  /** User unique ID */
  userId: number

  /** Token initialization timestamp */
  iat?: number

  /** Expiration timestamp */
  exp?: number
}

/**
 * Request interface for JWT-based authenticated user requests.
 *
 * Refer to `AuthGuard` for its dynamic population.
 */
export interface AuthReq extends Request {
  auth: IAccessTokenPayload
}
