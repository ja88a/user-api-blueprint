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
 * @interface ServiceHealthStatusDto
 */
export interface ServiceHealthStatusDto {
  /**
   * Service name, unique identifier
   * @type {string}
   * @memberof ServiceHealthStatusDto
   */
  name?: string
  /**
   * Service status
   * @type {string}
   * @memberof ServiceHealthStatusDto
   */
  status: ServiceHealthStatusDtoStatusEnum
  /**
   * Optional description of the service status
   * @type {string}
   * @memberof ServiceHealthStatusDto
   */
  info?: string
}

/**
 * @export
 */
export const ServiceHealthStatusDtoStatusEnum = {
  Ok: 'ok',
  Warning: 'warning',
  Error: 'error',
  Ok2: 'ok',
} as const
export type ServiceHealthStatusDtoStatusEnum =
  (typeof ServiceHealthStatusDtoStatusEnum)[keyof typeof ServiceHealthStatusDtoStatusEnum]

/**
 * Check if a given object implements the ServiceHealthStatusDto interface.
 */
export function instanceOfServiceHealthStatusDto(value: object): boolean {
  if (!('status' in value)) return false
  return true
}

export function ServiceHealthStatusDtoFromJSON(json: any): ServiceHealthStatusDto {
  return ServiceHealthStatusDtoFromJSONTyped(json, false)
}

export function ServiceHealthStatusDtoFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): ServiceHealthStatusDto {
  if (json == null) {
    return json
  }
  return {
    name: json['name'] == null ? undefined : json['name'],
    status: json['status'],
    info: json['info'] == null ? undefined : json['info'],
  }
}

export function ServiceHealthStatusDtoToJSON(
  value?: ServiceHealthStatusDto | null,
): any {
  if (value == null) {
    return value
  }
  return {
    name: value['name'],
    status: value['status'],
    info: value['info'],
  }
}
