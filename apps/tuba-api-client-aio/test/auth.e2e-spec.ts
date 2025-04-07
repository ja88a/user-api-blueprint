import { UsersApi } from '../src'
import { AuthenticationApi } from '../src/apis/AuthenticationApi'
import { USER_DEFAULTS, apiClientConfig } from './api-connect.helper'

describe('User Auth API (e2e)', () => {
  let authApiClient: AuthenticationApi
  let usersApiClient: UsersApi

  beforeEach(async () => {
    authApiClient = new AuthenticationApi(apiClientConfig)
    usersApiClient = new UsersApi(apiClientConfig)
  })

  it('authApiClient.getHealthAuth - GET /health - Check Auth service health', async () => {
    const res = await authApiClient.getHealthAuth()
    expect(res.status).toEqual('ok')
  })

  it('authApiClient.signUp - POST /auth/signup - Sign Up test user', async () => {
    await authApiClient.signUp({
      signUpEmailDto: {
        email: USER_DEFAULTS.userEmailAddress,
        password: USER_DEFAULTS.userPassword,
        wallet: USER_DEFAULTS.userWalletAddress,
        nickname: USER_DEFAULTS.userNameNick,
      },
    })
  })

  it('authApiClient.signInWithEmail - POST /auth/signin - Sign In test user', async () => {
    await authApiClient
      .signInWithEmail({
        signInEmailDto: {
          email: USER_DEFAULTS.userEmailAddress,
          password: USER_DEFAULTS.userPassword,
        },
      })
      .then(() => {
        usersApiClient
          .getUserCurrent()
          .then((userD) => {
            expect(userD.email).toEqual(USER_DEFAULTS.userEmailAddress)
            expect(userD.wallet).toEqual(USER_DEFAULTS.userWalletAddress)
            expect(userD.name.nick).toEqual(USER_DEFAULTS.userNameNick)
          })
          .catch((err) => {
            fail(err)
          })
      })
  })

  it('usersApiClient.getUserCurrent - GET /users/current - Retrieve current user profile', async () => {
    const userD = await usersApiClient.getUserCurrent()
    expect(userD.email).toEqual(USER_DEFAULTS.userEmailAddress)
    expect(userD.wallet).toEqual(USER_DEFAULTS.userWalletAddress)
    expect(userD.name.nick).toEqual(USER_DEFAULTS.userNameNick)
  })
})
