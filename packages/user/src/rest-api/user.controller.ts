import {
  EHealthStatus,
  EServiceName,
  ESubService,
} from '@jabba01/tuba-lib-utils-data'
import {
  AuthReq,
  BadRequestException,
  ConflictDto,
  HealthCheckDto,
  InternalServerErrorException,
  Public,
  UnauthorizedException,
  WS_CONFIG,
} from '@jabba01/tuba-lib-utils-ws'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger/dist/decorators'
import { Request as Req } from 'express'
import { API_TAG_USERS, EUserFlow, TUserNew } from '../data'
import { UserService } from '../service/user.service'
import {
  UserDto,
  UserNewDto,
  UserSearchFilterDto,
  UserSearchResultDto,
  UserUpdDto
} from './dto'
import {
  convertUserToDto
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
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {}

  @Get('health')
  @ApiOperation({
    summary: 'Service Health Check',
    description:
      'Check the service status and health.' +
      '\n\nThe returned HTTP status code reflects the working state of the service.' +
      '\n\nThe details of the service status and of its statuses is reported in the response data.' +
      '\n\nIf the service fails to connect to its database, it will exit.',
  })
  @Public()
  @ApiOkResponse({
    description: 'Service UP & Running',
    type: HealthCheckDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Service halted',
    type: HealthCheckDto,
  })
  async getHealthUser(@Request() req: Req): Promise<HealthCheckDto> {
    const serviceHealth = await this.userService.getStatus([ESubService.DATASTORE])
    if (serviceHealth.status === EHealthStatus.ERROR) {
      this.logger.error(
        `Service health checks fail: \n${JSON.stringify(serviceHealth)}`,
      )
      req.res?.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return serviceHealth
  }

  @Get()
  @ApiOperation({
    summary: 'List all users',
    description:
      'Get a list of all registered users.' +
      '\n\nRequester must have admin privileges.',
  })
  // TODO @ApiBearerAuth()
  @ApiOkResponse({
    description: 'List of all registered users',
    type: UserDto,
    isArray: true,
  })
  async getUsersAll(@Request() req: AuthReq): Promise<UserDto[]> {
    // TODO @RBAC Allow only platform admins to retrieve all users
    const context = {
      userId: req.auth?.userId,
      flow: EUserFlow.RETRIEVE,
    }
    const res = await this.userService.getAllUsers(context)
    return res?.map((u) => convertUserToDto(u, false))
  }

  @Post('check')
  @ApiOperation({
    summary: 'Validate User Info',
    description:
      'Validate the new or edited info of user profile: uniqueness, already used email or wallet addresses, etc',
  })
  // TODO @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'List of conflicts found, if any.',
    type: ConflictDto,
    isArray: true,
  })
  @ApiBody({
    description: 'User profile information',
    type: UserNewDto,
    required: true,
  })
  async checkUserInfo(
    @Request() req: AuthReq,
    @Body() userInfo: UserNewDto,
  ): Promise<ConflictDto[]> {
    const conflicts = await this.userService
      .validateUser(userInfo, {
        userId: req.auth?.userId,
        flow: EUserFlow.UPDATE,
      })
      .catch((err) => {
        this.logger.error(
          `Failed to validate user fields uniqueness \n${err.stack ?? err} \nCause: ${err.cause?.stack ?? err.cause}`,
        )
        throw err
      })
    return conflicts
  }

  @Get('current')
  @ApiOperation({
    summary: 'Get actual User',
    description: 'Retrieve profile info of the requesting user (authenticated).',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Current user profile information',
    type: UserDto,
  })
  async getUserCurrent(@Request() req: AuthReq): Promise<UserDto> {
    const context = {
      userId: req.auth?.userId,
      flow: EUserFlow.RETRIEVE,
    }
    if (context.userId === undefined)
      throw UnauthorizedException.UNAUTHORIZED_ACCESS('Invalid user ID')

    const user = await this.userService
      .getUserById(context.userId, context)
      .catch((err) => {
        this.logger.error(
          `Failed to get current user info \n${err.stack ?? err} \nCause: ${err.cause?.stack ?? err.cause}`,
        )
        throw err
      })

    return convertUserToDto(user, true)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get User',
    description: 'Retrieve a user profile based on its unique ID.',
  })
  // TODO @ApiBearerAuth()
  @ApiOkResponse({
    description: 'User profile information',
    type: UserDto,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Unique user identifier',
    type: Number,
    example: 421,
  })
  async getUserById(
    @Request() req: AuthReq,
    @Param('id') userId: number,
  ): Promise<UserDto> {
    // TODO @RBAC Allow only users to retrieve their own profile info, or a platform admin
    const context = {
      userId: req.auth?.userId,
      flow: EUserFlow.RETRIEVE,
    }

    const user = await this.userService.getUserById(userId, context).catch((err) => {
      this.logger.error(
        `Failed to get user by ID '${userId}' \n${err.stack ?? err} \nCause: ${err.cause?.stack ?? err.cause}`,
      )
      throw err
    })

    return convertUserToDto(user, context.userId === user.id)
  }

  @Post('search')
  @ApiOperation({
    summary: 'Search for Users',
    description:
      'Search for users by their ID or associated accounts (email, crypto or social).',
  })
  // TODO @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'User(s) matching the search criteria',
    type: UserSearchResultDto,
  })
  @ApiBody({
    description: 'User related search filters',
    type: UserSearchFilterDto,
  })
  async searchUsers(
    @Request() req: AuthReq,
    @Body() filter: UserSearchFilterDto,
  ): Promise<UserSearchResultDto> {
    // TODO @RBAC Allow only platform admins to search for users
    const context = {
      userId: req.auth?.userId,
      flow: EUserFlow.RETRIEVE,
    }
    const users = await this.userService
      .searchUsers(filter, context)
      .catch((err) => {
        this.logger.error(
          `Failed to search for users with filters '${JSON.stringify(filter)} - Context: '${JSON.stringify(context)}' \n${err.stack ?? err} \nCause: ${err.cause?.stack ?? err.cause}`,
        )
        throw InternalServerErrorException.UNEXPECTED_ERROR(
          `Search request for Users has failed - Filters: '${JSON.stringify(filter)}'`,
          err,
        )
      })

    if (!(users?.length > 0)) return { user: [] }

    return {
      user: users?.map((u) => convertUserToDto(u, context.userId === u.id)),
    }
  }

  // ========================================================================
  //
  // User Management - Write Operations
  //

  @Post()
  @ApiOperation({
    summary: 'Create User',
    description:
      'Create a new user profile, by providing the required information.',
  })
  // TODO @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The newly created user profile',
    type: UserDto,
  })
  @ApiBody({
    description: 'User profile information',
    type: UserNewDto,
    required: true,
  })
  async createUser(
    @Request() req: AuthReq,
    @Body() userNew: UserNewDto,
  ): Promise<UserDto> {
    const context = {
      userId: req.auth?.userId,
      flow: EUserFlow.REGISTER,
    }

    const userCreated = await this.userService
      .createUser(userNew, context)
      .catch((err) => {
        this.logger.error(
          `Failed to create user '${JSON.stringify(userNew)}' \n${err.stack ?? err} \nCause: ${err.cause?.stack ?? err.cause}`,
        )
        if (err instanceof BadRequestException) throw err
        throw InternalServerErrorException.UNEXPECTED_ERROR(
          `Failed to create new User from '${JSON.stringify(userNew)}'`,
          err,
        )
      })

    return convertUserToDto(userCreated, true)
  }


  @Patch(':id')
  @ApiOperation({
    summary: 'Update User',
    description:
      'Update partially the profile information of a user, by specifying its unique ID & the data set(s) to change.',
  })
  // TODO @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updated user profile information',
    type: UserDto,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Unique user identifier',
    type: Number,
    example: 421,
  })
  @ApiBody({
    description: 'User profile data set(s) to update',
    type: UserUpdDto,
    required: true,
  })
  async updateUserPartial(
    @Request() req: AuthReq,
    @Param('id') userId: number,
    @Body() userUpd: UserUpdDto,
  ): Promise<UserDto> {
    const context = {
      userId: req.auth?.userId,
      flow: EUserFlow.UPDATE,
    }

    if (userId !== context.userId)
      throw UnauthorizedException.UNAUTHORIZED_ACCESS(
        `User '${context.userId}' cannot update user '${userId}'`,
      )

    const userUpdated = await this.userService
      .updateUser({ ...(userUpd as TUserNew), id: userId }, context)
      .catch((err) => {
        this.logger.error(
          `Failed to update user '${userId}' with data '${JSON.stringify(userUpd)}' \n${err.stack ?? err} \nCause: ${err.cause?.stack ?? err.cause}`,
        )
        if (err instanceof BadRequestException) throw err
        throw InternalServerErrorException.UNEXPECTED_ERROR(
          `Failed to update user '${userId}' with data '${JSON.stringify(userUpd)}'`,
          err,
        )
      })

    return convertUserToDto(userUpdated, context.userId === userId)
  }

  /**
   * Remove a user from the system, by specifying its ID
   * @param req
   * @param userId
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete User',
    description:
      'Remove a user from the system, by specifying its unique ID.' +
      '\n\nOnly the user itself can delete its own profile, or a privileged user with admin rights.',
  })
  // TODO @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The removed user dataset.',
    type: UserDto,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Unique user identifier',
    type: Number,
    example: 421,
  })
  async deleteUser(
    @Request() req: AuthReq,
    @Param('id') userId: number,
  ): Promise<UserDto> {
    // FIXME @RBAC Allow only platform admins to delete users
    const context = {
      userId: req.auth?.userId,
      targetUserId: userId,
      flow: EUserFlow.DELETE,
    }
    // if (userId !== context.userId)
    //   throw UnauthorizedException.UNAUTHORIZED_ACCESS(
    //     `User '${context.userId}' cannot delete user '${userId}'`,
    //   )

    const userRemoved = await this.userService
      .deleteUser(userId, context)
      .catch((err) => {
        this.logger.error(
          `Failed to delete user '${userId}' \n${err.stack ?? err} \nCause: ${err.cause?.stack ?? err.cause}`,
        )
        throw err
      })

    return convertUserToDto(userRemoved, context.userId === userId)
  }
}
