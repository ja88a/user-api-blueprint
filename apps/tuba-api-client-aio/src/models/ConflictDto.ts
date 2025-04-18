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
 * @interface ConflictDto
 */
export interface ConflictDto {
  /**
   * Optional reporting of an entity ID, having conflicting field values with the submitted ones.
   * @type {string}
   * @memberof ConflictDto
   */
  id?: string
  /**
   * Field or service name for mapping the root cause of the conflict
   * @type {string}
   * @memberof ConflictDto
   */
  name: string
  /**
   * Type of conflict
   * @type {string}
   * @memberof ConflictDto
   */
  type: ConflictDtoTypeEnum
}

/**
 * @export
 */
export const ConflictDtoTypeEnum = {
  AlreadyExist: 'ALREADY_EXIST',
  DbValueUnique: 'DB_VALUE_UNIQUE',
} as const
export type ConflictDtoTypeEnum =
  (typeof ConflictDtoTypeEnum)[keyof typeof ConflictDtoTypeEnum]

/**
 * Check if a given object implements the ConflictDto interface.
 */
export function instanceOfConflictDto(value: object): boolean {
  if (!('name' in value)) return false
  if (!('type' in value)) return false
  return true
}

export function ConflictDtoFromJSON(json: any): ConflictDto {
  return ConflictDtoFromJSONTyped(json, false)
}

export function ConflictDtoFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): ConflictDto {
  if (json == null) {
    return json
  }
  return {
    id: json['id'] == null ? undefined : json['id'],
    name: json['name'],
    type: json['type'],
  }
}

export function ConflictDtoToJSON(value?: ConflictDto | null): any {
  if (value == null) {
    return value
  }
  return {
    id: value['id'],
    name: value['name'],
    type: value['type'],
  }
}
