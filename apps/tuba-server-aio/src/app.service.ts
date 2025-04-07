import {
  EHealthStatus,
  ESubService,
  IHealthStatus,
} from '@jabba01/tuba-lib-utils-data'
import { UserService } from '@jabba01/tuba-ws-user'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  constructor(
    private userService: UserService,
    // private logger: Logger,
  ) {}

  /**
   * Retrieve the service status
   * @returns service status information
   */
  async getStatus(): Promise<IHealthStatus> {
    const subServicesProms: Promise<IHealthStatus>[] = []
    const packJson = { version: '0.1' }

    const generalStatus: IHealthStatus = {
      name: 'tuba-api',
      status: EHealthStatus.OK,
      version: packJson.version,
    }

    subServicesProms.push(this.userService.getStatus([ESubService.DATASTORE]))

    await Promise.all(subServicesProms)
      .then((servicesStatus) => {
        const serviceError = servicesStatus.find(
          (serviceStatus) => serviceStatus.status === EHealthStatus.ERROR,
        )
        if (serviceError) generalStatus.status = EHealthStatus.ERROR
        generalStatus.services = servicesStatus
      })
      .catch((err) => {
        generalStatus.status = EHealthStatus.ERROR
        generalStatus.info = `Service health checks fail - some services are down \n${err}`
      })

    return generalStatus
  }
}
