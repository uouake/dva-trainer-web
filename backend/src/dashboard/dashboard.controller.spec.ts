import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { AttemptEntity } from '../infrastructure/db/attempt.entity';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

describe('DashboardController', () => {
  let controller: DashboardController;
  let attemptsRepo: jest.Mocked<Repository<AttemptEntity>>;
  let questionsRepo: jest.Mocked<Repository<QuestionEntity>>;

  const validUserId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    const mockAttemptsRepo = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
      delete: jest.fn(),
    };

    const mockQuestionsRepo = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: getRepositoryToken(AttemptEntity),
          useValue: mockAttemptsRepo,
        },
        {
          provide: getRepositoryToken(QuestionEntity),
          useValue: mockQuestionsRepo,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    attemptsRepo = module.get(getRepositoryToken(AttemptEntity));
    questionsRepo = module.get(getRepositoryToken(QuestionEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('overview', () => {
    it('should return dashboard overview with all KPIs', async () => {
      // Mock count calls
      attemptsRepo.count.mockResolvedValueOnce(100); // totalAttempts
      attemptsRepo.count.mockResolvedValueOnce(75); // correctAttempts

      // Mock query builder for practiced questions
      const mockGetRawOne = jest.fn().mockResolvedValue({ count: '50' });
      const mockWhere = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: mockGetRawOne,
      });

      // Mock query builder for weak concepts
      const mockGetRawMany = jest.fn().mockResolvedValue([
        { conceptKey: 'lambda', wrongCount: '10' },
        { conceptKey: 'vpc', wrongCount: '8' },
        { conceptKey: 'iam', wrongCount: '5' },
      ]);
      const mockInnerJoin = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          getRawMany: mockGetRawMany,
        }),
      });

      let queryBuilderCallCount = 0;
      attemptsRepo.createQueryBuilder.mockImplementation(() => {
        queryBuilderCallCount++;
        if (queryBuilderCallCount === 1) {
          return { where: mockWhere } as unknown as ReturnType<
            Repository<AttemptEntity>['createQueryBuilder']
          >;
        }
        return {
          innerJoin: mockInnerJoin,
        } as unknown as ReturnType<Repository<AttemptEntity>['createQueryBuilder']>;
      });

      const result = await controller.overview(validUserId);

      expect(result.ok).toBe(true);
      expect(result.totalAttempts).toBe(100);
      expect(result.correctAttempts).toBe(75);
      expect(result.successRate).toBe(75);
      expect(result.questionsPracticed).toBe(50);
      expect(result.weakConcepts).toHaveLength(3);
      expect(result.weakConcepts[0]).toEqual({ conceptKey: 'lambda', wrongCount: 10 });
    });

    it('should calculate success rate correctly for zero attempts', async () => {
      attemptsRepo.count.mockResolvedValueOnce(0); // totalAttempts
      attemptsRepo.count.mockResolvedValueOnce(0); // correctAttempts

      const mockGetRawOne = jest.fn().mockResolvedValue({ count: '0' });
      const mockWhere = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: mockGetRawOne,
      });

      const mockGetRawMany = jest.fn().mockResolvedValue([]);
      const mockInnerJoin = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          getRawMany: mockGetRawMany,
        }),
      });

      let queryBuilderCallCount = 0;
      attemptsRepo.createQueryBuilder.mockImplementation(() => {
        queryBuilderCallCount++;
        if (queryBuilderCallCount === 1) {
          return { where: mockWhere } as unknown as ReturnType<
            Repository<AttemptEntity>['createQueryBuilder']
          >;
        }
        return {
          innerJoin: mockInnerJoin,
        } as unknown as ReturnType<Repository<AttemptEntity>['createQueryBuilder']>;
      });

      const result = await controller.overview(validUserId);

      expect(result.successRate).toBeNull();
      expect(result.totalAttempts).toBe(0);
      expect(result.correctAttempts).toBe(0);
    });

    it('should calculate success rate correctly for partial attempts', async () => {
      attemptsRepo.count.mockResolvedValueOnce(10); // totalAttempts
      attemptsRepo.count.mockResolvedValueOnce(3); // correctAttempts

      const mockGetRawOne = jest.fn().mockResolvedValue({ count: '8' });
      const mockWhere = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: mockGetRawOne,
      });

      const mockGetRawMany = jest.fn().mockResolvedValue([
        { conceptKey: 's3', wrongCount: '5' },
      ]);
      const mockInnerJoin = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          getRawMany: mockGetRawMany,
        }),
      });

      let queryBuilderCallCount = 0;
      attemptsRepo.createQueryBuilder.mockImplementation(() => {
        queryBuilderCallCount++;
        if (queryBuilderCallCount === 1) {
          return { where: mockWhere } as unknown as ReturnType<
            Repository<AttemptEntity>['createQueryBuilder']
          >;
        }
        return {
          innerJoin: mockInnerJoin,
        } as unknown as ReturnType<Repository<AttemptEntity>['createQueryBuilder']>;
      });

      const result = await controller.overview(validUserId);

      expect(result.successRate).toBe(30); // 3/10 = 30%
    });

    it('should return empty weak concepts when no incorrect attempts', async () => {
      attemptsRepo.count.mockResolvedValueOnce(20);
      attemptsRepo.count.mockResolvedValueOnce(20);

      const mockGetRawOne = jest.fn().mockResolvedValue({ count: '15' });
      const mockWhere = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: mockGetRawOne,
      });

      const mockGetRawMany = jest.fn().mockResolvedValue([]);
      const mockInnerJoin = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          getRawMany: mockGetRawMany,
        }),
      });

      let queryBuilderCallCount = 0;
      attemptsRepo.createQueryBuilder.mockImplementation(() => {
        queryBuilderCallCount++;
        if (queryBuilderCallCount === 1) {
          return { where: mockWhere } as unknown as ReturnType<
            Repository<AttemptEntity>['createQueryBuilder']
          >;
        }
        return {
          innerJoin: mockInnerJoin,
        } as unknown as ReturnType<Repository<AttemptEntity>['createQueryBuilder']>;
      });

      const result = await controller.overview(validUserId);

      expect(result.weakConcepts).toEqual([]);
      expect(result.successRate).toBe(100);
    });

    it('should throw BadRequestException when userId is missing', async () => {
      await expect(controller.overview('')).rejects.toThrow(BadRequestException);
      await expect(controller.overview('')).rejects.toThrow('Missing userId');
    });

    it('should throw BadRequestException for invalid UUID', async () => {
      await expect(controller.overview('invalid-uuid')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.overview('invalid-uuid')).rejects.toThrow(
        'Invalid userId (expected UUID)',
      );
    });

    it('should reject UUID with wrong version', async () => {
      // UUID v6 instead of v4
      const invalidUuid = '550e8400-e29b-61d4-a716-446655440000';
      await expect(controller.overview(invalidUuid)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept valid UUID v4', async () => {
      attemptsRepo.count.mockResolvedValueOnce(0);
      attemptsRepo.count.mockResolvedValueOnce(0);

      const mockGetRawOne = jest.fn().mockResolvedValue({ count: '0' });
      const mockWhere = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: mockGetRawOne,
      });

      const mockGetRawMany = jest.fn().mockResolvedValue([]);
      const mockInnerJoin = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue({
          getRawMany: mockGetRawMany,
        }),
      });

      let queryBuilderCallCount = 0;
      attemptsRepo.createQueryBuilder.mockImplementation(() => {
        queryBuilderCallCount++;
        if (queryBuilderCallCount === 1) {
          return { where: mockWhere } as unknown as ReturnType<
            Repository<AttemptEntity>['createQueryBuilder']
          >;
        }
        return {
          innerJoin: mockInnerJoin,
        } as unknown as ReturnType<Repository<AttemptEntity>['createQueryBuilder']>;
      });

      // Valid UUID v4
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      await expect(controller.overview(validUuid)).resolves.toBeDefined();
    });

    it('should limit weak concepts to top 5', async () => {
      attemptsRepo.count.mockResolvedValueOnce(100);
      attemptsRepo.count.mockResolvedValueOnce(50);

      const mockGetRawOne = jest.fn().mockResolvedValue({ count: '40' });
      const mockWhere = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        getRawOne: mockGetRawOne,
      });

      const mockLimit = jest.fn();
      const mockGetRawMany = jest.fn().mockResolvedValue([
        { conceptKey: 'concept1', wrongCount: '20' },
        { conceptKey: 'concept2', wrongCount: '18' },
        { conceptKey: 'concept3', wrongCount: '15' },
        { conceptKey: 'concept4', wrongCount: '12' },
        { conceptKey: 'concept5', wrongCount: '10' },
        { conceptKey: 'concept6', wrongCount: '8' },
      ]);

      const mockInnerJoin = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: mockLimit.mockReturnValue({
          getRawMany: mockGetRawMany,
        }),
      });

      let queryBuilderCallCount = 0;
      attemptsRepo.createQueryBuilder.mockImplementation(() => {
        queryBuilderCallCount++;
        if (queryBuilderCallCount === 1) {
          return { where: mockWhere } as unknown as ReturnType<
            Repository<AttemptEntity>['createQueryBuilder']
          >;
        }
        return {
          innerJoin: mockInnerJoin,
        } as unknown as ReturnType<Repository<AttemptEntity>['createQueryBuilder']>;
      });

      await controller.overview(validUserId);

      expect(mockLimit).toHaveBeenCalledWith(5);
    });
  });

  describe('reset', () => {
    it('should delete all attempts for user and return count', async () => {
      attemptsRepo.delete.mockResolvedValue({ affected: 25, raw: [] });

      const result = await controller.reset(validUserId);

      expect(result.ok).toBe(true);
      expect(result.deleted).toBe(25);
      expect(attemptsRepo.delete).toHaveBeenCalledWith({ userId: validUserId });
    });

    it('should handle zero deleted attempts', async () => {
      attemptsRepo.delete.mockResolvedValue({ affected: 0, raw: [] });

      const result = await controller.reset(validUserId);

      expect(result.ok).toBe(true);
      expect(result.deleted).toBe(0);
    });

    it('should handle null affected value', async () => {
      attemptsRepo.delete.mockResolvedValue({ affected: null, raw: [] });

      const result = await controller.reset(validUserId);

      expect(result.ok).toBe(true);
      expect(result.deleted).toBe(0);
    });

    it('should throw BadRequestException when userId is missing', async () => {
      await expect(controller.reset('')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid UUID', async () => {
      await expect(controller.reset('not-a-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('domains', () => {
    it('should return domain statistics', async () => {
      const mockGetRawMany = jest.fn().mockResolvedValue([
        { domainKey: 'development', attempts: '30', correct: '25' },
        { domainKey: 'security', attempts: '25', correct: '20' },
        { domainKey: 'deployment', attempts: '20', correct: '15' },
      ]);

      attemptsRepo.createQueryBuilder.mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnValue({
            getRawMany: mockGetRawMany,
          }),
        }),
      } as unknown as ReturnType<Repository<AttemptEntity>['createQueryBuilder']>);

      const result = await controller.domains(validUserId);

      expect(result.ok).toBe(true);
      expect(result.items).toHaveLength(3);
      expect(result.items[0]).toEqual({
        domainKey: 'development',
        attempts: 30,
        correct: 25,
        successRate: 83,
      });
      expect(result.items[1]).toEqual({
        domainKey: 'security',
        attempts: 25,
        correct: 20,
        successRate: 80,
      });
    });

    it('should handle null domainKey', async () => {
      const mockGetRawMany = jest.fn().mockResolvedValue([
        { domainKey: null, attempts: '10', correct: '5' },
      ]);

      attemptsRepo.createQueryBuilder.mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnValue({
            getRawMany: mockGetRawMany,
          }),
        }),
      } as unknown as ReturnType<Repository<AttemptEntity>['createQueryBuilder']>);

      const result = await controller.domains(validUserId);

      expect(result.items[0].domainKey).toBe('unknown');
    });

    it('should return null successRate for zero attempts', async () => {
      const mockGetRawMany = jest.fn().mockResolvedValue([
        { domainKey: 'development', attempts: '0', correct: '0' },
      ]);

      attemptsRepo.createQueryBuilder.mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnValue({
            getRawMany: mockGetRawMany,
          }),
        }),
      } as unknown as ReturnType<Repository<AttemptEntity>['createQueryBuilder']>);

      const result = await controller.domains(validUserId);

      expect(result.items[0].successRate).toBeNull();
    });

    it('should return empty items when no attempts', async () => {
      const mockGetRawMany = jest.fn().mockResolvedValue([]);

      attemptsRepo.createQueryBuilder.mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnValue({
            getRawMany: mockGetRawMany,
          }),
        }),
      } as unknown as ReturnType<Repository<AttemptEntity>['createQueryBuilder']>);

      const result = await controller.domains(validUserId);

      expect(result.items).toEqual([]);
    });

    it('should throw BadRequestException when userId is missing', async () => {
      await expect(controller.domains('')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid UUID', async () => {
      await expect(controller.domains('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should order domains alphabetically', async () => {
      const mockOrderBy = jest.fn().mockReturnValue({
        getRawMany: jest.fn().mockResolvedValue([]),
      });

      attemptsRepo.createQueryBuilder.mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          orderBy: mockOrderBy,
        }),
      } as unknown as ReturnType<Repository<AttemptEntity>['createQueryBuilder']>);

      await controller.domains(validUserId);

      expect(mockOrderBy).toHaveBeenCalledWith('q.domainKey', 'ASC');
    });
  });
});
