import { EUserStatus, EUserType, TUser, TUserIdentifier, TUserNew } from '../../data'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsAlphanumeric,
  IsDate,
  IsDefined,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  Length,
  ValidateNested,
} from 'class-validator'
import {
  UserAccountDto,
  UserAccountIdDto,
  UserAccountNewDto,
} from './user-account.dto'

/**
 * User identification data
 */
export class UserIdDto implements TUserIdentifier {
  @ApiProperty({
    description:
      "Unique user ID.\n\nAlternatively, the user's unique email or crypto account address can be used for identification, refer to `account`",
    example: 720,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number

  @ApiProperty({
    description:
      "User associated account's unique identifier.\n\nAlternative to specifying the user `id` field",
    type: UserAccountIdDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAccountIdDto)
  accountRef?: UserAccountIdDto
}

/**
 * New User information
 */
export class UserNewDto implements TUserNew {
  @ApiProperty({
    description:
      'User display name, or first name.' +
      '\n\nIf not specified, a default one will be generated from the associated account(s).',
    type: String,
    example: 'Jane',
  })
  @IsOptional()
  @Length(3, 64)
  name?: string

  @ApiProperty({
    description: 'Optional user last / family name',
    type: String,
    example: 'Smith',
  })
  @IsOptional()
  @Length(1, 128)
  nameLast?: string

  @ApiProperty({
    description:
      'User profile type.' +
      '\n\nIf not specified, user will be created as an individual.',
    enum: EUserType,
    example: EUserType.BUSINESS,
    default: EUserType.INDIVIDUAL,
  })
  @IsOptional()
  @IsEnum(EUserType)
  type?: EUserType

  @ApiProperty({
    description:
      'User associated sub-accounts: crypto wallet account (EOA), email, social network, oauth2, etc',
    type: UserAccountNewDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => UserAccountNewDto)
  account: UserAccountNewDto[]
}

export class UserUpdDto implements Partial<TUserNew> {
  @ApiProperty({
    description:
      'User display name, or first name.' +
      '\n\nIf not specified, a default one will be generated from the associated account(s).',
    type: String,
    example: 'Jane',
  })
  @IsOptional()
  @Length(3, 64)
  name?: string

  @ApiProperty({
    description: 'Optional user last / family name.',
    type: String,
    example: 'Smith',
  })
  @IsOptional()
  @Length(1, 128)
  nameLast?: string

  @ApiProperty({
    description: 'User profile type',
    enum: EUserType,
    example: EUserType.INDIVIDUAL,
    default: EUserType.INDIVIDUAL,
  })
  @IsOptional()
  @IsEnum(EUserType)
  type?: EUserType

  @ApiProperty({
    description:
      'User associated sub-accounts: crypto wallet account (EOA), email, social network, oauth2, etc',
    type: UserAccountNewDto,
    isArray: true,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserAccountNewDto)
  account?: UserAccountNewDto[]
}

/**
 * User information
 */
export class UserDto extends UserNewDto implements TUser {
  @ApiProperty({
    description: 'Unique user ID',
    type: Number,
    example: 944,
  })
  @IsInt()
  @IsPositive()
  id: number

  @ApiProperty({
    description: 'User profile general status',
    enum: EUserStatus,
    example: 'valid',
  })
  @IsEnum(EUserStatus)
  status: EUserStatus

  @ApiProperty({
    description: 'User unique handle',
    type: String,
    example: 'jane#7128',
  })
  @IsAlphanumeric()
  @Length(4, 64)
  handle: string

  @ApiProperty({
    description:
      'User display name, or first name.' +
      '\n\nIf not specified, a default one will be generated from the associated account(s).',
    type: String,
    example: 'Jane',
  })
  @IsDefined()
  @Length(3, 64)
  name: string

  @ApiProperty({
    description: 'User profile type',
    enum: EUserType,
    example: EUserType.INDIVIDUAL,
  })
  @IsDefined()
  @IsEnum(EUserType)
  type: EUserType

  @ApiProperty({
    description:
      'User associated sub-accounts: crypto wallet account (EOA), email, social network, oauth2, etc',
    type: UserAccountDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => UserAccountDto)
  account: UserAccountDto[]

  @ApiProperty({
    description: 'Last time the user info were updated',
    example: '2024-11-14T06:02:00Z',
  })
  @IsOptional()
  @IsDate()
  updatedAt?: Date

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2021-07-19T00:32:04Z',
  })
  @IsOptional()
  @IsDate()
  createdAt?: Date
}
