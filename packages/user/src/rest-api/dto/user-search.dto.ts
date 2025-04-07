import { ESubEntityDataset } from '@jabba01/tuba-lib-utils-data'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator'
import { UserDto, UserIdDto } from './user.dto'
import { TUserSearchFilter, TUserSearchResult } from '../../data'

/**
 * Filter options to search for users.
 *
 * At least a `project` or a `market` filter must be specified, alternatively a `user`.
 *
 * Defining the `blockchain` filter enables to limit the scope of the market projects search.
 */
export class UserSearchFilterDto implements TUserSearchFilter {
  @ApiProperty({
    description:
      'Reference(s) to users to search for, via their ID or associated account(s)',
    type: UserIdDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserIdDto)
  user: UserIdDto[]

  @ApiProperty({
    description:
      'Optional specification of sub-entities dataset to be included in the search results.' +
      '\n\nIf not specified, then only the reference ID of related entities are provided.',
    isArray: true,
    enum: ESubEntityDataset,
    example: [ESubEntityDataset.USER_ACCOUNT, ESubEntityDataset.USER_INFO],
  })
  @IsOptional()
  @IsEnum(ESubEntityDataset, { each: true })
  subEntities?: ESubEntityDataset[]
}

/**
 * Results of a search request for projects
 */
export class UserSearchResultDto implements TUserSearchResult {
  @ApiProperty({
    description: 'Found User(s) info matching the search criteria',
    type: UserDto,
    isArray: true,
  })
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto[]
}
