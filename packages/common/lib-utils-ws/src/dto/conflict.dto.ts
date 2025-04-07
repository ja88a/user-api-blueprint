import { IConflict, EConflictType } from '@jabba01/tuba-lib-utils-data'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'

/**
 * A conflict reported by the datastore
 */
export class ConflictDto implements IConflict {
  @ApiProperty({
    description:
      'Optional reporting of an entity ID, having conflicting field values with the submitted ones.',
    type: String,
    example: '1234567890',
  })
  id?: string

  @ApiProperty({
    description: 'Field or service name for mapping the root cause of the conflict',
    type: String,
    example: 'emailAddress',
  })
  name: string

  /** Type of conflict
   * @example "DB_VALUE_UNIQUE" */
  @ApiProperty({
    description: 'Type of conflict',
    enum: EConflictType,
    example: EConflictType.EXIST,
  })
  @IsEnum(EConflictType)
  type: EConflictType
}
