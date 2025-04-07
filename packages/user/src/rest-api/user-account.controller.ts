import {
  EServiceName
} from '@jabba01/tuba-lib-utils-data'
import {
  AuthReq,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  WS_CONFIG
} from '@jabba01/tuba-lib-utils-ws'
import {
  Body,
  Controller,
  Delete,
  Logger,
  Param,
  Post,
  Request
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger/dist/decorators'
import { API_TAG_USERS, EUserFlow } from '../data'
import { UserAccountService } from '../service/user-account.service'
import { UserService } from '../service/user.service'
import {
  UserAccountDto,
  UserAccountIdDto,
  UserAccountNewDto,
  UserDto
} from './dto'
import {
  convertUserAccountsToDto,
  convertUserToDto,
} from './dto/convert-user-dto.utils'

/**
 * Controller for the Template WebService
 */
@ApiTags(API_TAG_USERS)
@Controller({
  version: WS_CONFIG.VERSION_PUBLIC,
  path: EServiceName.USERS,
})
@ApiBadRequestResponse({
  description: 'Invalid inputs',
  type: BadRequestException,
})
@ApiInternalServerErrorResponse({
  description: 'Internal processing error',
  type: InternalServerErrorException,
})
@ApiUnauthorizedResponse({
  description: 'Unauthorized access',
  type: UnauthorizedException,
})
export class UserAccountController {
  constructor(
    private readonly userService: UserService,
    private readonly userAccountService: UserAccountService,
    private readonly logger: Logger,
  ) {}

  @Post('search/account')
  @ApiOperation({
    summary: 'Search User from Sub-Account',
    description:
      'Retrieve a user profile from one of its associated sub-account, e.g. an email or wallet account address.',
  })
  // TODO @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Profile information of the User, if found.',
    type: UserDto,
  })
  @ApiBadRequestResponse({
    description: 'No user found with the specified account',
    type: BadRequestException,
  })
  @ApiBody({
    description: 'User sub-account reference',
    type: UserAccountIdDto,
    required: true,
  })
  async getUserByAccount(
    @Request() req: AuthReq,
    @Body() account: UserAccountIdDto,
  ): Promise<UserDto> {
    const context = {
      userId: req.auth?.userId,
      flow: EUserFlow.RETRIEVE,
    }

    // FIXME @RBAC Allow only privileged users to retrieve user profiles
    const user = await this.userService
      .getUserBySubAccount(account, context)
      .catch((err) => {
        this.logger.error(
          `Failed to get user by account '${account}' \n${err.stack ?? err} \nCause: ${err.cause?.stack ?? err.cause}`,
        )
        throw err
      })

    if (!(user?.id > 0)) {
      this.logger.log(
        `No user found by searching for sub-account '${JSON.stringify(account)}'`,
      )
      throw BadRequestException.RESOURCE_NOT_FOUND(
        `No user found with sub-account '${JSON.stringify(account)}'`,
      )
    }

    return convertUserToDto(user, user.id === context.userId)
  }

  @Post(':id/accounts')
  @ApiOperation({
    summary: 'Add User Sub-Account',
    description:
      'Associate one or more new email, crypto or social sub-accounts to a given user.',
  })
  // TODO @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The newly created user account(s)',
    type: UserAccountDto,
    isArray: true,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Unique user identifier',
    type: Number,
    example: 421,
  })
  @ApiBody({
    description: 'User account information',
    type: UserAccountNewDto,
    isArray: true,
    required: true,
  })
  async addUserAccounts(
    @Request() req: AuthReq,
    @Param('id') userId: number,
    @Body() account: UserAccountNewDto[],
  ): Promise<UserAccountDto[]> {
    const context = {
      userId: req.auth?.userId,
      flow: EUserFlow.UPDATE_ACCOUNT,
    }

    if (userId !== context.userId)
      throw UnauthorizedException.UNAUTHORIZED_ACCESS(
        `User '${context.userId}' cannot add sub-account to user '${userId}'`,
      )

    const accountsStored = await this.userAccountService
      .addUserAccounts({ id: userId }, account, context)
      .catch((err) => {
        this.logger.error(
          `Failed to add account '${JSON.stringify(account)}' to user '${userId}' \n${err.stack ?? err} \nCause: ${err.cause?.stack ?? err.cause}`,
        )
        if (err instanceof BadRequestException) throw err
        throw InternalServerErrorException.UNEXPECTED_ERROR(
          `Failed to add account '${JSON.stringify(account)}' to user '${userId}'`,
          err,
        )
      })
    return convertUserAccountsToDto(accountsStored, context.userId === userId)
  }

  @Delete(':id/accounts/:accountId')
  @ApiOperation({
    summary: 'Remove User Sub-Account',
    description: 'Remove a user associated sub-account from a given user profile.',
  })
  // TODO @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Removed user account data',
    type: UserAccountDto,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Unique user identifier',
    type: Number,
    example: 421,
  })
  @ApiParam({
    name: 'accountId',
    required: true,
    description: 'Unique user account identifier',
    type: Number,
    example: 421,
  })
  async removeUserAccount(
    @Request() req: AuthReq,
    @Param('id') userId: number,
    @Param('accountId') accountId: number,
  ): Promise<UserAccountDto> {
    const context = {
      userId: req.auth?.userId,
      flow: EUserFlow.UPDATE_ACCOUNT,
    }

    if (userId !== context.userId)
      throw UnauthorizedException.UNAUTHORIZED_ACCESS(
        `User '${context.userId}' cannot remove sub-account of user '${userId}'`,
      )

    const accountStored = await this.userAccountService
      .removeUserAccount({ id: userId }, { id: accountId }, context)
      .catch((err) => {
        this.logger.error(
          `Failed to remove account '${accountId}' from user '${userId}' \n${err.stack ?? err} \nCause: ${err.cause?.stack ?? err.cause}`,
        )
        if (err instanceof BadRequestException) throw err
        throw InternalServerErrorException.UNEXPECTED_ERROR(
          `Failed to remove account '${accountId}' from user '${userId}'`,
          err,
        )
      })
    return convertUserAccountsToDto([accountStored], context.userId === userId)?.[0]
  }
}
