import {
  BadRequestException,
  InternalServerErrorException,
} from '@jabba01/tuba-lib-utils-ws'
import { Test, TestingModule } from '@nestjs/testing'
import { UserDatastoreService } from '../database'
import { UserDatastoreServiceMock } from '../database/test/user-ds.mock-service'
import { UserService } from '../service/user.service'
import { UserServiceModule } from './user-service.module'
import { USERS_1 } from '../database/test/user-ds.mock-data'
import { ESubService, IRequestContext } from '@jabba01/tuba-lib-utils-data'
import { EUserAccountType, TUser, TUserIdentifier, TUserNew } from '../data'

describe('UserService', () => {
  let userService: UserService
  let datastoreService: UserDatastoreService

  const DefaultRequestContext: IRequestContext = {
    userId: undefined,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserServiceModule],
      //   providers: [UserService, UserDatastoreService],
    })
      .overrideProvider(UserDatastoreService)
      .useClass(UserDatastoreServiceMock)
      .compile()

    userService = module.get<UserService>(UserService)
    // datastoreService = module.get<UserDatastoreService>(UserDatastoreService)
  })

  describe('getAllUsers', () => {
    it('should retrieve all users from the datastore', async () => {
      const expectedUsers = Array.from(USERS_1.values())

      const users = await userService.getAllUsers(DefaultRequestContext)

      expect(users).toEqual(expectedUsers)
    })
  })

  describe('getUserById', () => {
    it('should retrieve a user by ID from the datastore', async () => {
      const userId = 1
      const expectedUser = USERS_1.get(userId)
      const user = await userService.getUserById(userId, DefaultRequestContext)
      expect(user).toEqual(expectedUser)
    })

    it('should not retrieve the unknown user ID', async () => {
      const userId = 10000 // Unexisting ID
      const user = await userService.getUserById(userId, DefaultRequestContext)
      expect(user).toBeUndefined()
    })
  })

  describe('getUsersById', () => {
    it('should retrieve users by IDs from the datastore', async () => {
      const userIds = [1, 2, 3]
      const expectedUsers = userIds
        .map((id) => USERS_1.get(id))
        .filter((user) => user !== undefined)

      const users = await userService.getUsersById(userIds, DefaultRequestContext)

      expect(expectedUsers.length).toEqual(3)
      expect(users.length).toEqual(expectedUsers.length)
    })

    it('should not retrieve users by IDs from the datastore', async () => {
      const userIds = [100, 200, 300]
      const expectedUsers = userIds
        .map((id) => USERS_1.get(id))
        .filter((user) => user !== undefined)

      const users = await userService.getUsersById(userIds, DefaultRequestContext)

      expect(users).toEqual(expectedUsers)
      expect(users.length).toEqual(0)
    })

    it('should retrieve only 1 user by IDs from the datastore', async () => {
      const userIds = [100, 2, 300]
      const expectedUsers = userIds
        .map((id) => USERS_1.get(id))
        .filter((user) => user !== undefined)

      const users = await userService.getUsersById(userIds, DefaultRequestContext)

      expect(users).toEqual(expectedUsers)
      expect(users.length).toEqual(1)
    })
  })

  describe('getUser', () => {
    it('should retrieve a user by ID', async () => {
      const userId = 5
      const user: TUser = USERS_1.get(userId)
      const result = await userService.getUser({ id: userId }, DefaultRequestContext)
      expect(result).toEqual(user)
    })

    it('should retrieve a user by sub-account identifier', async () => {
      const userId = 1
      const expectedUser = USERS_1.get(userId)

      const accountRef: TUserIdentifier['accountRef'] = {
        type: EUserAccountType.EMAIL,
        identifier: 'jane' + userId + '@test.com',
      }

      const result = await userService.getUser({ accountRef }, DefaultRequestContext)
      //   expect(result).toEqual(expectedUser)
    })

    it('should not retrieve a user by sub-account identifier if non-existing', async () => {
      const accountRef: TUserIdentifier['accountRef'] = {
        type: EUserAccountType.EMAIL,
        identifier: 'john@test-unknown.com',
      }

      const result = await userService.getUser({ accountRef }, DefaultRequestContext)
      expect(result).toBeUndefined()
    })

    it('should return no result if no relevant user identification info is found', async () => {
      const userRef: TUserIdentifier = {}

      await expect(
        userService.getUser(userRef, DefaultRequestContext),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('createUser', () => {
    const userName = 'user-test-add1'
    const userEmail = 'user1@test.com'
    const userValid1Data: TUserNew = {
      name: userName,
      account: [
        {
          type: EUserAccountType.EMAIL,
          identifier: userEmail,
        },
      ],
    }
    
    let userCreatedRes: TUser

    it('should successfully create a new user', async () => {
      const user = await userService.createUser(
        userValid1Data,
        DefaultRequestContext,
      )
      expect(user).toBeDefined()
      expect(user.name).toEqual(userName)
      expect(user.account?.length).toEqual(1)
      expect(user.account[0].type).toEqual(EUserAccountType.EMAIL)
      expect(user.account[0].identifier).toEqual(userEmail)
      userCreatedRes = user
    })

    const userInvalid1Data: TUserNew = {
      name: userName,
      account: [
        {
          type: EUserAccountType.EMAIL,
          identifier: undefined,
        },
      ],
    }

    it('should fail to create an invalid user', async () => {
      await expect(
        userService.createUser(userInvalid1Data, DefaultRequestContext),
      ).rejects.toThrow(BadRequestException)
    })

    // it('should retrieve the previously created user from its email', async () => {
    //   const user = await userService.getUser(
    //     {
    //       accountRef: {
    //         type: EUserAccountType.EMAIL,
    //         identifier: userEmail,
    //       },
    //     },
    //     DefaultRequestContext,
    //   )
    //   expect(user).toBeDefined()
    // })

    it ('should retrieve the previously created user from its ID', async () => {
        const user = await userService.getUserById(userCreatedRes.id, DefaultRequestContext)
        expect(user).toBeDefined
    })

    it('should fail to add a user with same email address', async () => {
      await expect(
        userService.createUser(
          {
            account: [
              {
                type: EUserAccountType.EMAIL,
                identifier: userEmail,
              },
            ],
          },
          DefaultRequestContext,
        ),
      ).rejects.toThrow(BadRequestException)
    })
  })
})
