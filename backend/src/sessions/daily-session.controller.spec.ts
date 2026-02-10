import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { DailySessionController } from './daily-session.controller';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';
import { UserEntity } from '../infrastructure/db/user.entity';

describe('DailySessionController', () => {
  let controller: DailySessionController;
  let questionsRepo: jest.Mocked<Repository<QuestionEntity>>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<QuestionEntity>>;

  const createMockQuestion = (id: string, overrides: Partial<QuestionEntity> = {}): QuestionEntity => ({
    id,
    exam: 'dva-c02',
    topic: 1,
    questionNumber: 1,
    stem: 'Test question stem',
    choices: { A: 'Choice A', B: 'Choice B', C: 'Choice C', D: 'Choice D' },
    answer: 'A',
    conceptKey: 'test-concept',
    domainKey: 'development',
    frExplanation: 'Test explanation',
    sourceUrl: 'https://example.com',
    textHash: 'hash123',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<QuestionEntity>>;

    const mockRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailySessionController],
      providers: [
        {
          provide: getRepositoryToken(QuestionEntity),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DailySessionController>(DailySessionController);
    questionsRepo = module.get(getRepositoryToken(QuestionEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('should return daily session with default 10 questions', async () => {
      const questions = Array.from({ length: 10 }, (_, i) =>
        createMockQuestion(`q-${i}`),
      );
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({});

      expect(result.mode).toBe('daily');
      expect(result.limit).toBe(10);
      expect(result.items).toHaveLength(10);
    });

    it('should return daily session with custom limit', async () => {
      const questions = Array.from({ length: 15 }, (_, i) =>
        createMockQuestion(`q-${i}`),
      );
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({ limit: 15 });

      expect(result.limit).toBe(15);
      expect(result.items).toHaveLength(15);
    });

    it('should enforce maximum limit of 25', async () => {
      const questions = Array.from({ length: 25 }, (_, i) =>
        createMockQuestion(`q-${i}`),
      );
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({ limit: 50 });

      expect(result.limit).toBe(25);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(25);
    });

    it('should enforce minimum limit of 1', async () => {
      const questions = [createMockQuestion('q-1')];
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({ limit: 0 });

      expect(result.limit).toBe(1);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
    });

    it('should only include active questions', async () => {
      const questions = [createMockQuestion('q-1')];
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      await controller.start({});

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('q.isActive = true');
    });

    it('should order by RANDOM()', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await controller.start({});

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('RANDOM()');
    });

    it('should handle empty question bank gracefully', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await controller.start({});

      expect(result.mode).toBe('daily');
      expect(result.limit).toBe(10);
      expect(result.items).toEqual([]);
    });

    it('should return questions with full structure', async () => {
      const questions = [
        createMockQuestion('q-1', {
          stem: 'Detailed question stem',
          answer: 'B',
          conceptKey: 'lambda-functions',
          domainKey: 'development',
          frExplanation: 'Detailed explanation',
          sourceUrl: 'https://aws.amazon.com',
        }),
      ];
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({ limit: 1 });

      expect(result.items[0]).toHaveProperty('id', 'q-1');
      expect(result.items[0]).toHaveProperty('stem', 'Detailed question stem');
      expect(result.items[0]).toHaveProperty('choices');
      expect(result.items[0]).toHaveProperty('answer', 'B');
      expect(result.items[0]).toHaveProperty('conceptKey', 'lambda-functions');
      expect(result.items[0]).toHaveProperty('domainKey', 'development');
      expect(result.items[0]).toHaveProperty('frExplanation');
      expect(result.items[0]).toHaveProperty('sourceUrl');
    });

    it('should handle limit of 1', async () => {
      const questions = [createMockQuestion('single-question')];
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({ limit: 1 });

      expect(result.limit).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should handle limit at boundary (25)', async () => {
      const questions = Array.from({ length: 25 }, (_, i) =>
        createMockQuestion(`boundary-${i}`),
      );
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({ limit: 25 });

      expect(result.limit).toBe(25);
      expect(result.items).toHaveLength(25);
    });

    it('should handle undefined limit', async () => {
      const questions = Array.from({ length: 10 }, (_, i) =>
        createMockQuestion(`default-${i}`),
      );
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({ limit: undefined });

      expect(result.limit).toBe(10);
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
    });

    it('should handle null limit', async () => {
      const questions = Array.from({ length: 10 }, (_, i) =>
        createMockQuestion(`null-${i}`),
      );
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({ limit: null as unknown as number });

      expect(result.limit).toBe(10);
    });

    it('should handle negative limit', async () => {
      const questions = [createMockQuestion('neg')];
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({ limit: -5 });

      expect(result.limit).toBe(1);
    });

    it('should query with correct alias', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await controller.start({});

      expect(questionsRepo.createQueryBuilder).toHaveBeenCalledWith('q');
    });

    it('should return questions from multiple domains', async () => {
      const questions = [
        createMockQuestion('dev-1', { domainKey: 'development' }),
        createMockQuestion('sec-1', { domainKey: 'security' }),
        createMockQuestion('dep-1', { domainKey: 'deployment' }),
        createMockQuestion('trb-1', { domainKey: 'troubleshooting' }),
      ];
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({ limit: 4 });

      const domainKeys = result.items.map((q) => q.domainKey);
      expect(domainKeys).toContain('development');
      expect(domainKeys).toContain('security');
      expect(domainKeys).toContain('deployment');
      expect(domainKeys).toContain('troubleshooting');
    });

    it('should preserve question order from database', async () => {
      const questions = [
        createMockQuestion('first', { questionNumber: 1 }),
        createMockQuestion('second', { questionNumber: 2 }),
        createMockQuestion('third', { questionNumber: 3 }),
      ];
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({ limit: 3 });

      expect(result.items[0].id).toBe('first');
      expect(result.items[1].id).toBe('second');
      expect(result.items[2].id).toBe('third');
    });

    it('should call getMany after setting up query', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await controller.start({});

      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
      expect(mockQueryBuilder.limit).toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should handle questions with different topics', async () => {
      const questions = [
        createMockQuestion('topic-1', { topic: 1, questionNumber: 5 }),
        createMockQuestion('topic-2', { topic: 2, questionNumber: 10 }),
        createMockQuestion('topic-3', { topic: 3, questionNumber: 15 }),
      ];
      mockQueryBuilder.getMany.mockResolvedValue(questions);

      const result = await controller.start({ limit: 3 });

      expect(result.items).toHaveLength(3);
      expect(result.items.map((q) => q.topic)).toEqual([1, 2, 3]);
    });

    it('should handle float limit', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await controller.start({ limit: 15.7 });

      // Floats are preserved but clamped between 1-25
      expect(result.limit).toBe(15.7);
    });

    it('should handle very large limit gracefully', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await controller.start({ limit: 1000000 });

      expect(result.limit).toBe(25);
    });
  });
});
