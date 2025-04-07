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
/**
 *
 * @export
 * @interface UserAccountNewDto
 */
export interface UserAccountNewDto {
  /**
   * Type of user account
   * @type {string}
   * @memberof UserAccountNewDto
   */
  type: UserAccountNewDtoTypeEnum
  /**
   * Account unique address or handle, depending on the account type.
   * @type {string}
   * @memberof UserAccountNewDto
   */
  identifier: string
  /**
   * Account name
   * @type {string}
   * @memberof UserAccountNewDto
   */
  name?: string
  /**
   * Specify if this is the default account for the given type of account.
   *
   * Only one account of a given type can be set as default.
   * @type {boolean}
   * @memberof UserAccountNewDto
   */
  _default?: boolean
}

/**
 * @export
 */
export const UserAccountNewDtoTypeEnum = {
  Wallet: 'wallet',
  Email: 'email',
} as const
export type UserAccountNewDtoTypeEnum =
  (typeof UserAccountNewDtoTypeEnum)[keyof typeof UserAccountNewDtoTypeEnum]

/**
 * Check if a given object implements the UserAccountNewDto interface.
 */
export function instanceOfUserAccountNewDto(value: object): boolean {
  if (!('type' in value)) return false
  if (!('identifier' in value)) return false
  return true
}

export function UserAccountNewDtoFromJSON(json: any): UserAccountNewDto {
  return UserAccountNewDtoFromJSONTyped(json, false)
}

export function UserAccountNewDtoFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): UserAccountNewDto {
  if (json == null) {
    return json
  }
  return {
    type: json['type'],
    identifier: json['identifier'],
    name: json['name'] == null ? undefined : json['name'],
    _default: json['default'] == null ? undefined : json['default'],
  }
}

export function UserAccountNewDtoToJSON(value?: UserAccountNewDto | null): any {
  if (value == null) {
    return value
  }
  return {
    type: value['type'],
    identifier: value['identifier'],
    name: value['name'],
    default: value['_default'],
  }
}
