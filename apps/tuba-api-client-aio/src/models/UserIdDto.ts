/* tslint:disable */
/* eslint-disable */
/**
 * TUBA API
 * TUBA by Jabba ø1 - OpenAPI
 *
 * The version of the OpenAPI document: 1.0
 * Contact: tuba.support@none.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime'
import type { UserAccountIdDto } from './UserAccountIdDto'
import {
  UserAccountIdDtoFromJSON,
  UserAccountIdDtoFromJSONTyped,
  UserAccountIdDtoToJSON,
} from './UserAccountIdDto'

/**
 *
 * @export
 * @interface UserIdDto
 */
export interface UserIdDto {
  /**
   * Unique user ID.
   *
   * Alternatively, the user's unique email or crypto account address can be used for identification, refer to `account`
   * @type {number}
   * @memberof UserIdDto
   */
  id?: number
  /**
   * User associated account's unique identifier.
   *
   * Alternative to specifying the user `id` field
   * @type {UserAccountIdDto}
   * @memberof UserIdDto
   */
  accountRef?: UserAccountIdDto
}

/**
 * Check if a given object implements the UserIdDto interface.
 */
export function instanceOfUserIdDto(value: object): boolean {
  return true
}

export function UserIdDtoFromJSON(json: any): UserIdDto {
  return UserIdDtoFromJSONTyped(json, false)
}

export function UserIdDtoFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): UserIdDto {
  if (json == null) {
    return json
  }
  return {
    id: json['id'] == null ? undefined : json['id'],
    accountRef:
      json['accountRef'] == null
        ? undefined
        : UserAccountIdDtoFromJSON(json['accountRef']),
  }
}

export function UserIdDtoToJSON(value?: UserIdDto | null): any {
  if (value == null) {
    return value
  }
  return {
    id: value['id'],
    accountRef: UserAccountIdDtoToJSON(value['accountRef']),
  }
}
