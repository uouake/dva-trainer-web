import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AttemptsController } from './attempts.controller';
import { AttemptEntity, AttemptMode } from '../infrastructure/db/attempt.entity';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

describe('AttemptsController', () => {
  let controller: AttemptsController;
  let attemptsRepo: jest.Mocked<Repository<AttemptEntity>>;
  let questionsRepo: jest.Mocked<Repository<QuestionEntity>>;

  const validUserId = '550e8400-e29b-41d4-a716-446655440000';
  const validQuestionId = 'dva-c02:topic:1:question:1:abc123';

  const createMockQuestion = (
    id: string,
    answer: string,
    overrides: Partial<QuestionEntity> = {},
  ): QuestionEntity => ({
    id,
    exam: 'dva-c02',
    topic: 1,
    questionNumber: 1,
    stem: 'Test question',
    choices: { A: 'Choice A', B: 'Choice B', C: 'Choice C', D: 'Choice D' },
    answer,
    conceptKey: 'test-concept',
    domainKey: 'development',
    frExplanation: 'Explanation',
    sourceUrl: 'https://example.com',
    textHash: 'hash123',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    const mockAttemptsRepo = {
      save: jest.fn(),
    };

    const mockQuestionsRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttemptsController],
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

    controller = module.get<AttemptsController>(AttemptsController);
    attemptsRepo = module.get(getRepositoryToken(AttemptEntity));
    questionsRepo = module.get(getRepositoryToken(QuestionEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a correct attempt', async () => {
      const question = createMockQuestion(validQuestionId, 'B');
      questionsRepo.findOne.mockResolvedValue(question);

      const savedAttempt: AttemptEntity = {
        id: 'attempt-uuid-123',
        userId: validUserId,
        questionId: validQuestionId,
        mode: 'daily' as AttemptMode,
        selectedChoice: 'B',
        isCorrect: true,
        authType: 'anonymous',
        githubUserId: null,
        createdAt: new Date(),
      };
      attemptsRepo.save.mockResolvedValue(savedAttempt);

      const result = await controller.create({
        userId: validUserId,
        questionId: validQuestionId,
        mode: 'daily',
        selectedChoice: 'B',
      });

      expect(result.ok).toBe(true);
      expect(result.attemptId).toBe('attempt-uuid-123');
      expect(result.isCorrect).toBe(true);
      expect(result.correctAnswer).toBe('B');
    });

    it('should create an incorrect attempt', async () => {
      const question = createMockQuestion(validQuestionId, 'C');
      questionsRepo.findOne.mockResolvedValue(question);

      const savedAttempt: AttemptEntity = {
        id: 'attempt-uuid-456',
        userId: validUserId,
        questionId: validQuestionId,
        mode: 'exam' as AttemptMode,
        selectedChoice: 'A',
        isCorrect: false,
        authType: 'anonymous',
        githubUserId: null,
        createdAt: new Date(),
      };
      attemptsRepo.save.mockResolvedValue(savedAttempt);

      const result = await controller.create({
        userId: validUserId,
        questionId: validQuestionId,
        mode: 'exam',
        selectedChoice: 'A',
      });

      expect(result.ok).toBe(true);
      expect(result.attemptId).toBe('attempt-uuid-456');
      expect(result.isCorrect).toBe(false);
      expect(result.correctAnswer).toBe('C');
    });

    it('should support daily mode', async () => {
      const question = createMockQuestion(validQuestionId, 'A');
      questionsRepo.findOne.mockResolvedValue(question);

      attemptsRepo.save.mockResolvedValue({
        id: 'attempt-1',
        userId: validUserId,
        questionId: validQuestionId,
        mode: 'daily' as AttemptMode,
        selectedChoice: 'A',
        isCorrect: true,
        authType: 'anonymous',
        githubUserId: null,
        createdAt: new Date(),
      });

      const result = await controller.create({
        userId: validUserId,
        questionId: validQuestionId,
        mode: 'daily',
        selectedChoice: 'A',
      });

      expect(result.ok).toBe(true);
    });

    it('should support exam mode', async () => {
      const question = createMockQuestion(validQuestionId, 'D');
      questionsRepo.findOne.mockResolvedValue(question);

      attemptsRepo.save.mockResolvedValue({
        id: 'attempt-2',
        userId: validUserId,
        questionId: validQuestionId,
        mode: 'exam' as AttemptMode,
        selectedChoice: 'D',
        isCorrect: true,
        authType: 'anonymous',
        githubUserId: null,
        createdAt: new Date(),
      });

      const result = await controller.create({
        userId: validUserId,
        questionId: validQuestionId,
        mode: 'exam',
        selectedChoice: 'D',
      });

      expect(result.ok).toBe(true);
    });

    it('should throw BadRequestException when userId is missing', async () => {
      await expect(
        controller.create({
          userId: '',
          questionId: validQuestionId,
          mode: 'daily',
          selectedChoice: 'A',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when questionId is missing', async () => {
      await expect(
        controller.create({
          userId: validUserId,
          questionId: '',
          mode: 'daily',
          selectedChoice: 'A',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when mode is missing', async () => {
      await expect(
        controller.create({
          userId: validUserId,
          questionId: validQuestionId,
          mode: '' as AttemptMode,
          selectedChoice: 'A',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when selectedChoice is missing', async () => {
      await expect(
        controller.create({
          userId: validUserId,
          questionId: validQuestionId,
          mode: 'daily',
          selectedChoice: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid UUID', async () => {
      await expect(
        controller.create({
          userId: 'invalid-uuid',
          questionId: validQuestionId,
          mode: 'daily',
          selectedChoice: 'A',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.create({
          userId: 'invalid-uuid',
          questionId: validQuestionId,
          mode: 'daily',
          selectedChoice: 'A',
        }),
      ).rejects.toThrow('Invalid userId (expected UUID)');
    });

    it('should throw NotFoundException when question does not exist', async () => {
      questionsRepo.findOne.mockResolvedValue(null);

      await expect(
        controller.create({
          userId: validUserId,
          questionId: 'non-existent-question',
          mode: 'daily',
          selectedChoice: 'A',
        }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.create({
          userId: validUserId,
          questionId: 'non-existent-question',
          mode: 'daily',
          selectedChoice: 'A',
        }),
      ).rejects.toThrow('Unknown questionId');
    });

    it('should correctly identify correct answer for all choices', async () => {
      const choices = ['A', 'B', 'C', 'D'];

      for (const correctChoice of choices) {
        const question = createMockQuestion(validQuestionId, correctChoice);
        questionsRepo.findOne.mockResolvedValue(question);

        attemptsRepo.save.mockImplementation((attempt) =>
          Promise.resolve({
            ...attempt,
            id: `attempt-${correctChoice}`,
            createdAt: new Date(),
          } as AttemptEntity),
        );

        const result = await controller.create({
          userId: validUserId,
          questionId: validQuestionId,
          mode: 'daily',
          selectedChoice: correctChoice,
        });

        expect(result.isCorrect).toBe(true);
        expect(result.correctAnswer).toBe(correctChoice);
      }
    });

    it('should correctly identify incorrect answers', async () => {
      const question = createMockQuestion(validQuestionId, 'C');
      questionsRepo.findOne.mockResolvedValue(question);

      const wrongChoices = ['A', 'B', 'D'];

      for (const wrongChoice of wrongChoices) {
        attemptsRepo.save.mockImplementation((attempt) =>
          Promise.resolve({
            ...attempt,
            id: `attempt-${wrongChoice}`,
            createdAt: new Date(),
          } as AttemptEntity),
        );

        const result = await controller.create({
          userId: validUserId,
          questionId: validQuestionId,
          mode: 'daily',
          selectedChoice: wrongChoice,
        });

        expect(result.isCorrect).toBe(false);
        expect(result.correctAnswer).toBe('C');
      }
    });

    it('should save attempt with correct properties', async () => {
      const question = createMockQuestion(validQuestionId, 'A');
      questionsRepo.findOne.mockResolvedValue(question);

      attemptsRepo.save.mockImplementation((attempt) =>
        Promise.resolve({
          ...attempt,
          id: 'saved-attempt-id',
          createdAt: new Date(),
        } as AttemptEntity),
      );

      await controller.create({
        userId: validUserId,
        questionId: validQuestionId,
        mode: 'daily',
        selectedChoice: 'A',
      });

      expect(attemptsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: validUserId,
          questionId: validQuestionId,
          mode: 'daily',
          selectedChoice: 'A',
          isCorrect: true,
        }),
      );
    });

    it('should query question by id', async () => {
      const question = createMockQuestion(validQuestionId, 'B');
      questionsRepo.findOne.mockResolvedValue(question);

      attemptsRepo.save.mockResolvedValue({
        id: 'attempt-id',
        userId: validUserId,
        questionId: validQuestionId,
        mode: 'daily' as AttemptMode,
        selectedChoice: 'B',
        isCorrect: true,
        authType: 'anonymous',
        githubUserId: null,
        createdAt: new Date(),
      });

      await controller.create({
        userId: validUserId,
        questionId: validQuestionId,
        mode: 'daily',
        selectedChoice: 'B',
      });

      expect(questionsRepo.findOne).toHaveBeenCalledWith({
        where: { id: validQuestionId },
      });
    });

    it('should accept various UUID v4 formats', async () => {
      const validUuids = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      ];

      const question = createMockQuestion(validQuestionId, 'A');
      questionsRepo.findOne.mockResolvedValue(question);

      for (const uuid of validUuids) {
        attemptsRepo.save.mockResolvedValue({
          id: 'attempt-id',
          userId: uuid,
          questionId: validQuestionId,
          mode: 'daily' as AttemptMode,
          selectedChoice: 'A',
          isCorrect: true,
          authType: 'anonymous',
          githubUserId: null,
          createdAt: new Date(),
        });

        const result = await controller.create({
          userId: uuid,
          questionId: validQuestionId,
          mode: 'daily',
          selectedChoice: 'A',
        });

        expect(result.ok).toBe(true);
      }
    });

    it('should reject non-UUID userId formats', async () => {
      const invalidIds = [
        'simple-string',
        '12345',
        'user@example.com',
        '550e8400-e29b-61d4-a716-446655440000', // UUID v6
        '550e8400-e29b-01d4-a716-446655440000', // UUID v1
      ];

      for (const invalidId of invalidIds) {
        await expect(
          controller.create({
            userId: invalidId,
            questionId: validQuestionId,
            mode: 'daily',
            selectedChoice: 'A',
          }),
        ).rejects.toThrow(BadRequestException);
      }
    });

    it('should handle uppercase UUID', async () => {
      const uppercaseUuid = '550E8400-E29B-41D4-A716-446655440000';
      const question = createMockQuestion(validQuestionId, 'A');
      questionsRepo.findOne.mockResolvedValue(question);

      attemptsRepo.save.mockResolvedValue({
        id: 'attempt-id',
        userId: uppercaseUuid,
        questionId: validQuestionId,
        mode: 'daily' as AttemptMode,
        selectedChoice: 'A',
        isCorrect: true,
        authType: 'anonymous',
        githubUserId: null,
        createdAt: new Date(),
      });

      const result = await controller.create({
        userId: uppercaseUuid,
        questionId: validQuestionId,
        mode: 'daily',
        selectedChoice: 'A',
      });

      expect(result.ok).toBe(true);
    });
  });
});
