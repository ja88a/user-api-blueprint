import {
  EUserAccountStatus,
  EUserAccountType,
  TUserAccount,
  TUserAccountIdentifier,
  TUserAccountNew,
} from '../../data'
import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Length,
} from 'class-validator'

export class UserAccountIdDto implements TUserAccountIdentifier {
  @ApiProperty({
    description:
      "Unique user account ID.\n\nAlternatively, the user's unique email or crypto account address can be used for identification, refer to `identifier` and `type`",
    type: Number,
    example: 720,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id?: number

  @ApiProperty({
    description:
      'User account unique identifier, e.g. email, crypto account address, social network handle, etc' +
      '\n\nAlternative to specifying the user `id` field. When specified, the `type` field must also be set',
    type: String,
    example: 'jane.smith@none.com',
  })
  @IsOptional()
  @Length(3, 128)
  identifier?: string

  @ApiProperty({
    description: 'Type of account',
    enum: EUserAccountType,
    example: EUserAccountType.EMAIL,
  })
  @IsOptional()
  @IsEnum(EUserAccountType)
  type?: EUserAccountType
}

export class UserAccountNewDto implements TUserAccountNew {
  @ApiProperty({
    description: 'Type of user account',
    example: EUserAccountType.EMAIL,
    enum: EUserAccountType,
  })
  @IsEnum(EUserAccountType)
  type: EUserAccountType

  @ApiProperty({
    description: 'Account unique address or handle, depending on the account type.',
    example: 'jane.smith@none.com',
  })
  @IsNotEmpty()
  @Length(3, 128)
  identifier: string

  @ApiProperty({
    description: 'Account name',
    example: 'Email - main',
  })
  @IsOptional()
  @Length(4, 64)
  name?: string

  @ApiProperty({
    description:
      'Specify if this is the default account for the given type of account.\n\nOnly one account of a given type can be set as default.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  default?: boolean
}

export class UserAccountDto extends UserAccountNewDto implements TUserAccount {
  @ApiProperty({
    description: 'Unique user account ID',
    example: 720,
  })
  @IsInt()
  @IsPositive()
  id: number

  @ApiProperty({
    description: 'Account status',
    example: EUserAccountStatus.ENABLED,
    enum: EUserAccountStatus,
  })
  @IsEnum(EUserAccountStatus)
  status: EUserAccountStatus

  @ApiProperty({
    description: 'Last change date & time',
    type: Date,
    example: '2023-01-28T18:12:40Z',
  })
  @IsOptional()
  @IsDate()
  updatedAt?: Date

  @ApiProperty({
    description: 'Account creation date & time',
    type: Date,
    example: '2021-08-02T12:00:00Z',
  })
  @IsOptional()
  @IsDate()
  createdAt?: Date
}
