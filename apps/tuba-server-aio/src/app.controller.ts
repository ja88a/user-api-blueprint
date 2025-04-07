import { EHealthStatus } from '@jabba01/tuba-lib-utils-data'
import { HealthCheckDto, Public } from '@jabba01/tuba-lib-utils-ws'
import { Controller, Get, HttpStatus, Logger, Request } from '@nestjs/common'
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger/dist/decorators'
import { Request as Req } from 'express'
import { AppService } from './app.service'

/**
 * General Controller for the API app server
 */
@ApiTags('General')
@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    private readonly logger: Logger,
  ) {}

  /**
   * TUBA Web Services general Health Check: report web services' status.
   *
   * @returns service status information
   */
  @Get('health')
  @ApiOperation({ summary: 'TUBA Services Status' })
  @Public()
  @ApiOkResponse({
    description: 'Service UP & Running',
    type: HealthCheckDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'One or more Services are not properly working',
    type: HealthCheckDto,
  })
  async getHealth(@Request() req: Req): Promise<HealthCheckDto> {
    const serviceHealth = await this.appService.getStatus()
    if (serviceHealth.status === EHealthStatus.ERROR) {
      this.logger.error(
        `Service health checks fail - some services are down: \n${JSON.stringify(serviceHealth)}`,
      )
      req.res?.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return serviceHealth
  }
}
