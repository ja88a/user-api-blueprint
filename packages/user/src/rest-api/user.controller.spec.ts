import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { UserController } from './user.controller'
import { UserService } from '../service/user.service'

describe('AppController', () => {
  let appController: UserController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile()

    appController = app.get<UserController>(UserController)
  })

  describe('root', () => {
    it('should return "Hello TUBA user!"', () => {
      expect(appController.getUsersAll(request)).toBe('Hello TUBA user!')
    })
  })
})
