import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsSemVer,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { IHealthStatus, EHealthStatus } from '@jabba01/tuba-lib-utils-data'
import { HealthCheckDto } from '@jabba01/tuba-lib-utils-ws'

/**
 * Response data for a web service health check, and potentially its sub-services
 */
export class AIOHealthCheckDto implements IHealthStatus {
  /** Service name / identifier
   * @example 'users-ws' */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  /** Status of the service
   * @example 'ok' */
  @IsNotEmpty()
  @IsEnum(EHealthStatus)
  status: EHealthStatus = EHealthStatus.OK

  /** Optional statuses of sub-services */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HealthCheckDto)
  services?: HealthCheckDto[]

  /** Optional description of the service status
   * @example 'Service is working as expected' */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  info?: string

  /** Service version number
   * @example '1.3.2' */
  @IsOptional()
  @IsSemVer()
  version?: string
}
