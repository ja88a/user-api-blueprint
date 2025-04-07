import { WS_CONFIG } from '@jabba01/tuba-lib-utils-ws/dist/api-config'
import { Configuration } from '../src/runtime'

export enum EHostBasePath {
  DEVELOPMENT = 'https://dev.tuba.com/',
  STAGING = 'https://api.stg.tuba.com/',
  PRODUCTION = 'https://api.tuba.none.com/',
  LOCAL = 'http://localhost:3000/',
}

export const apiClientConfig = new Configuration({
  basePath: EHostBasePath.LOCAL + WS_CONFIG.URI_DOMAIN_API,
  apiKey: 'access_token',
  credentials: 'include', // 'same-origin',
})
