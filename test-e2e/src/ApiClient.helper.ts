import { Configuration, HTTPHeaders, UsersApi } from '@jabba01/tuba-api-client-aio'
import { BASE_PATH } from './Test.constant'

import { logger as loggerW } from '@jabba01/tuba-lib-utils-common'

const _logger = loggerW.child({ context: 'ApiService' })

export type IApis = {
  users: UsersApi
}

export class ApiService {
  readonly apis: IApis
  private headers: HTTPHeaders

  constructor() {
    this.headers = {
      'x-correlation-id': 'e2e-test_' + new Date().toISOString(),
    }

    const clientConfig = new Configuration({
      basePath: BASE_PATH,
      headers: this.headers,
      accessToken: '',
    })

    this.apis = {
      users: new UsersApi(clientConfig),
    }
  }
}
