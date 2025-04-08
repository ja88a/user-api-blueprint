import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { UserDatastoreService } from '../src/database'
import { UserDatastoreServiceMock } from '../src/database/test/user-ds.mock-service'
import { UserModule } from '../src/rest-api'

describe('UserController (e2e)', () => {
  let app: INestApplication
  let userDatastoreMock = new UserDatastoreServiceMock()

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      // imports: [UserModule, UserServiceModule, UserDatastoreModule],
      imports: [UserModule],
      // providers: [UserService, UserDatastoreService],
    })
      .overrideProvider(UserDatastoreService)
      .useValue(userDatastoreMock)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(404)
  })

  it('/tuba-api/v1/users/health (GET)', () => {
    return request(app.getHttpServer()).get('/tuba-api/v1/users/health').expect(200).expect('Hello World!')
  })
})
