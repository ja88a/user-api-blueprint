import { IException } from '@jabba01/tuba-lib-utils-data'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, Length } from 'class-validator'
import { ExceptionConstants } from '../exceptions'

export class ErrorDto implements IException {
  @ApiProperty({
    enum: ExceptionConstants.BadRequestCodes,
    description: 'A unique code identifying the error.',
    example: ExceptionConstants.BadRequestCodes.VALIDATION_ERROR,
  })
  @IsOptional()
  @IsNumber()
  code?: number

  @ApiProperty({
    description: 'Message for the exception',
    example: 'Bad Request',
  })
  @IsString()
  @Length(3, 256)
  message: string

  @ApiProperty({
    description: 'A description of the error message.',
    example: 'The input provided was invalid',
  })
  @IsOptional()
  @IsString()
  @Length(3, 512)
  description?: string

  @ApiHideProperty()
  cause?: Error
}
