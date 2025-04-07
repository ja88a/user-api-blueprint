import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { UserModule } from '../src/rest-api'
import { UserDatastoreModule, UserDatastoreService } from '../src/database'
import { UserService, UserServiceModule } from '../src/service'
import { UserDatastoreServiceMock } from '../src/database/test/user-ds.mock-service'

describe('AppController (e2e)', () => {
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
    return request(app.getHttpServer()).get('/').expect(404).expect('Hello World!')
  })

  it('/tuba-api/v1/users/health (GET)', () => {
    return request(app.getHttpServer()).get('/tuba-api/v1/users/health').expect(200).expect('Hello World!')
  })
})
