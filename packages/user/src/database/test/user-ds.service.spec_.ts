import { Test, TestingModule } from '@nestjs/testing';
import { UserDatastoreService } from '../user-ds.service';
import { UserDatastoreModule } from '../user-ds.module';

describe('UserDatastoreService', () => {
  let service: UserDatastoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserDatastoreModule],
      // providers: [UserDatastoreService, UserService],
    }).compile();

    service = module.get<UserDatastoreService>(UserDatastoreService);
  });

  describe('testConnection', () => {
    it('should return the current time from the database', async () => {
      const result = await service.testDbConnection();
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('retrieveUserAll', () => {
    it('should return an array of users', async () => {
      const result = await service.retrieveUserAll();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('retrieveUserById', () => {
    it('should return a user with the specified ID', async () => {
      const result = await service.retrieveUserById(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should return undefined for an invalid ID', async () => {
      const result = await service.retrieveUserById(0);
      expect(result).toBeUndefined();
    });
  });

  // Add more test cases for other methods in UserDatastoreService

});