import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { AttemptEntity } from '../infrastructure/db/attempt.entity';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

describe('DashboardController', () => {
  let controller: DashboardController;
  let attemptsRepo: jest.Mocked<Partial<Repository<AttemptEntity>>>;

  const validUserId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    attemptsRepo = {
      count: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '0' }),
        getRawMany: jest.fn().mockResolvedValue([]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: getRepositoryToken(AttemptEntity),
          useValue: attemptsRepo,
        },
        {
          provide: getRepositoryToken(QuestionEntity),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUserId', () => {
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
      const invalidUuid = '550e8400-e29b-61d4-a716-446655440000';
      await expect(controller.overview(invalidUuid)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept valid UUID v4', async () => {
      (attemptsRepo.delete as jest.Mock).mockResolvedValue({ affected: 0, raw: [] });
      
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      await expect(controller.reset(validUuid)).resolves.toBeDefined();
    });
  });

  describe('reset', () => {
    it('should delete all attempts for user and return count', async () => {
      (attemptsRepo.delete as jest.Mock).mockResolvedValue({ affected: 25, raw: [] });

      const result = await controller.reset(validUserId);

      expect(result.ok).toBe(true);
      expect(result.deleted).toBe(25);
      expect(attemptsRepo.delete).toHaveBeenCalledWith({ userId: validUserId });
    });

    it('should handle zero deleted attempts', async () => {
      (attemptsRepo.delete as jest.Mock).mockResolvedValue({ affected: 0, raw: [] });

      const result = await controller.reset(validUserId);

      expect(result.ok).toBe(true);
      expect(result.deleted).toBe(0);
    });

    it('should handle null affected value', async () => {
      (attemptsRepo.delete as jest.Mock).mockResolvedValue({ affected: null, raw: [] });

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
    it('should throw BadRequestException when userId is missing', async () => {
      await expect(controller.domains('')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid UUID', async () => {
      await expect(controller.domains('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('calculateSuccessRate', () => {
    it('should calculate 100% success rate', async () => {
      (attemptsRepo.count as jest.Mock)
        .mockResolvedValueOnce(10)  // totalAttempts
        .mockResolvedValueOnce(10); // correctAttempts

      const result = await controller.overview(validUserId);
      expect(result.successRate).toBe(100);
    });

    it('should calculate 0% success rate', async () => {
      (attemptsRepo.count as jest.Mock)
        .mockResolvedValueOnce(10)  // totalAttempts
        .mockResolvedValueOnce(0);  // correctAttempts

      const result = await controller.overview(validUserId);
      expect(result.successRate).toBe(0);
    });

    it('should calculate 50% success rate', async () => {
      (attemptsRepo.count as jest.Mock)
        .mockResolvedValueOnce(10)  // totalAttempts
        .mockResolvedValueOnce(5);  // correctAttempts

      const result = await controller.overview(validUserId);
      expect(result.successRate).toBe(50);
    });

    it('should return null for zero attempts', async () => {
      (attemptsRepo.count as jest.Mock)
        .mockResolvedValueOnce(0)  // totalAttempts
        .mockResolvedValueOnce(0); // correctAttempts

      const result = await controller.overview(validUserId);
      expect(result.successRate).toBeNull();
    });
  });
});
