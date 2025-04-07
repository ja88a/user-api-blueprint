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
import { ApiProperty } from '@nestjs/swagger'

/**
 * Status information for a single service within the web service runtime
 */
export class ServiceHealthStatusDto implements IHealthStatus {
  @ApiProperty({
    description: 'Service name, unique identifier',
    example: 'database',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiProperty({
    enum: EHealthStatus,
    description: 'Service status',
    example: 'ok',
  })
  @IsNotEmpty()
  @IsEnum(EHealthStatus)
  status: EHealthStatus = EHealthStatus.OK

  @ApiProperty({
    description: 'Optional description of the service status',
    example: 'Service is working as expected',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  info?: string
}

/**
 * Response data for a web service health check
 */
export class HealthCheckDto implements IHealthStatus {
  @ApiProperty({
    description: 'Service name, unique identifier',
    example: 'users-ws',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string

  @ApiProperty({
    enum: EHealthStatus,
    description: 'Service status',
    example: 'ok',
  })
  @IsNotEmpty()
  @IsEnum(EHealthStatus)
  status: EHealthStatus = EHealthStatus.OK

  @ApiProperty({
    type: ServiceHealthStatusDto,
    description: 'List of sub-service statuses',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceHealthStatusDto)
  services?: ServiceHealthStatusDto[]

  @ApiProperty({
    description: 'Service version number',
    example: '1.0.0',
  })
  @IsOptional()
  @IsSemVer()
  version?: string
}
