import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ExamController } from './exam.controller';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

describe('ExamController', () => {
  let controller: ExamController;
  let questionsRepo: jest.Mocked<Repository<QuestionEntity>>;

  const createMockQuestion = (
    id: string,
    domainKey: string,
    overrides: Partial<QuestionEntity> = {},
  ): QuestionEntity => ({
    id,
    exam: 'dva-c02',
    topic: 1,
    questionNumber: 1,
    stem: 'Test question',
    choices: { A: 'Choice A', B: 'Choice B', C: 'Choice C', D: 'Choice D' },
    answer: 'A',
    conceptKey: 'test-concept',
    domainKey,
    frExplanation: 'Explanation',
    sourceUrl: 'https://example.com',
    textHash: 'hash123',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamController],
      providers: [
        {
          provide: getRepositoryToken(QuestionEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    controller = module.get<ExamController>(ExamController);
    questionsRepo = module.get(getRepositoryToken(QuestionEntity));
  });

  describe('start', () => {
    it('should return exam with default 65 questions', async () => {
      // Create sufficient questions for all domains
      const questions: QuestionEntity[] = [
        ...Array.from({ length: 25 }, (_, i) =>
          createMockQuestion(`dev-${i}`, 'development'),
        ),
        ...Array.from({ length: 20 }, (_, i) =>
          createMockQuestion(`sec-${i}`, 'security'),
        ),
        ...Array.from({ length: 20 }, (_, i) =>
          createMockQuestion(`dep-${i}`, 'deployment'),
        ),
        ...Array.from({ length: 15 }, (_, i) =>
          createMockQuestion(`trb-${i}`, 'troubleshooting'),
        ),
      ];

      questionsRepo.find.mockResolvedValue(questions);

      const result = await controller.start({});

      expect(result.mode).toBe('exam');
      expect(result.count).toBe(65);
      expect(result.durationMinutes).toBe(130);
      expect(result.items).toHaveLength(65);
      expect(result.distribution).toBeDefined();
      expect(result.distribution.development).toBe(21);
      expect(result.distribution.security).toBe(17);
      expect(result.distribution.deployment).toBe(16);
      expect(result.distribution.troubleshooting).toBe(11);
    });

    it('should return exam with custom count', async () => {
      const questions = Array.from({ length: 10 }, (_, i) =>
        createMockQuestion(`q-${i}`, 'development'),
      );

      questionsRepo.find.mockResolvedValue(questions);

      const result = await controller.start({ count: 10, strict: false });

      expect(result.count).toBe(10);
      expect(result.items).toHaveLength(10);
    });

    it('should limit count to 65 maximum', async () => {
      const questions = Array.from({ length: 100 }, (_, i) =>
        createMockQuestion(`q-${i}`, 'development'),
      );

      questionsRepo.find.mockResolvedValue(questions);

      const result = await controller.start({ count: 100 });

      expect(result.count).toBeLessThanOrEqual(65);
    });

    it('should enforce minimum count of 1', async () => {
      const questions = [createMockQuestion('q-1', 'development')];

      questionsRepo.find.mockResolvedValue(questions);

      const result = await controller.start({ count: 0 });

      expect(result.count).toBeGreaterThanOrEqual(1);
    });

    it('should throw BadRequestException in strict mode when not enough questions', async () => {
      const questions: QuestionEntity[] = [
        createMockQuestion('q-1', 'development'),
      ];

      questionsRepo.find.mockResolvedValue(questions);

      await expect(controller.start({ strict: true })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should complete with available questions in non-strict mode', async () => {
      const questions: QuestionEntity[] = [
        createMockQuestion('q-1', 'development'),
        createMockQuestion('q-2', 'security'),
        createMockQuestion('q-3', 'deployment'),
      ];

      questionsRepo.find.mockResolvedValue(questions);

      const result = await controller.start({ strict: false });

      expect(result.count).toBe(3);
      expect(result.items).toHaveLength(3);
    });

    it('should only include active questions', async () => {
      const activeQuestion = createMockQuestion('active-1', 'development');
      const inactiveQuestion = createMockQuestion('inactive-1', 'development', {
        isActive: false,
      });

      questionsRepo.find.mockResolvedValue([activeQuestion]);

      await controller.start({});

      expect(questionsRepo.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it('should shuffle questions randomly', async () => {
      const questions = Array.from({ length: 65 }, (_, i) =>
        createMockQuestion(`q-${i}`, 'development'),
      );

      questionsRepo.find.mockResolvedValue(questions);

      const result1 = await controller.start({});
      const result2 = await controller.start({});

      // The shuffled order should be different most of the time
      const ids1 = result1.items.map((q) => q.id);
      const ids2 = result2.items.map((q) => q.id);

      // Note: There's a very small chance this could fail if shuffling produces same order
      expect(ids1).not.toEqual(ids2);
    });

    it('should include questions from all 4 domains when available', async () => {
      const questions: QuestionEntity[] = [
        ...Array.from({ length: 25 }, (_, i) =>
          createMockQuestion(`dev-${i}`, 'development'),
        ),
        ...Array.from({ length: 20 }, (_, i) =>
          createMockQuestion(`sec-${i}`, 'security'),
        ),
        ...Array.from({ length: 20 }, (_, i) =>
          createMockQuestion(`dep-${i}`, 'deployment'),
        ),
        ...Array.from({ length: 15 }, (_, i) =>
          createMockQuestion(`trb-${i}`, 'troubleshooting'),
        ),
      ];

      questionsRepo.find.mockResolvedValue(questions);

      const result = await controller.start({});

      const domainKeys = new Set(result.items.map((q) => q.domainKey));
      expect(domainKeys.has('development')).toBe(true);
      expect(domainKeys.has('security')).toBe(true);
      expect(domainKeys.has('deployment')).toBe(true);
      expect(domainKeys.has('troubleshooting')).toBe(true);
    });

    it('should handle unknown domain questions in non-strict mode', async () => {
      const questions: QuestionEntity[] = [
        ...Array.from({ length: 50 }, (_, i) =>
          createMockQuestion(`known-${i}`, 'development'),
        ),
        ...Array.from({ length: 15 }, (_, i) =>
          createMockQuestion(`unknown-${i}`, 'unknown'),
        ),
      ];

      questionsRepo.find.mockResolvedValue(questions);

      const result = await controller.start({ strict: false });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.distribution.unknown).toBeGreaterThanOrEqual(0);
    });

    it('should log warning when less than 65 questions available', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const questions = Array.from({ length: 30 }, (_, i) =>
        createMockQuestion(`q-${i}`, 'development'),
      );

      questionsRepo.find.mockResolvedValue(questions);

      await controller.start({});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Only 30 questions available'),
      );

      consoleSpy.mockRestore();
    });

    it('should handle questions with null domainKey', async () => {
      const questions: QuestionEntity[] = [
        ...Array.from({ length: 50 }, (_, i) =>
          createMockQuestion(`dev-${i}`, 'development'),
        ),
        ...Array.from({ length: 15 }, (_, i) =>
          createMockQuestion(`null-${i}`, null as unknown as string),
        ),
      ];

      questionsRepo.find.mockResolvedValue(questions);

      const result = await controller.start({ strict: false });

      expect(result.count).toBeGreaterThanOrEqual(50);
    });

    it('should include correct question structure in response', async () => {
      const questions = [
        createMockQuestion('q-1', 'development', {
          stem: 'Test stem',
          answer: 'B',
          conceptKey: 'lambda',
        }),
      ];

      questionsRepo.find.mockResolvedValue(questions);

      const result = await controller.start({ count: 1, strict: false });

      expect(result.items[0]).toHaveProperty('id');
      expect(result.items[0]).toHaveProperty('stem');
      expect(result.items[0]).toHaveProperty('choices');
      expect(result.items[0]).toHaveProperty('answer');
      expect(result.items[0]).toHaveProperty('domainKey');
    });
  });
});
