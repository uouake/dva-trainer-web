import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionsController } from './questions.controller';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

describe('QuestionsController', () => {
  let controller: QuestionsController;
  let questionsRepo: jest.Mocked<Repository<QuestionEntity>>;

  const createMockQuestion = (
    id: string,
    overrides: Partial<QuestionEntity> = {},
  ): QuestionEntity => ({
    id,
    exam: 'dva-c02',
    topic: 1,
    questionNumber: 1,
    stem: 'Test question stem',
    choices: { A: 'Choice A', B: 'Choice B', C: 'Choice C', D: 'Choice D' },
    answer: 'A',
    conceptKey: 'test-concept',
    domainKey: 'development',
    frExplanation: 'Test explanation in French',
    sourceUrl: 'https://example.com/source',
    textHash: 'abc123hash',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    ...overrides,
  });

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: getRepositoryToken(QuestionEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    controller = module.get<QuestionsController>(QuestionsController);
    questionsRepo = module.get(getRepositoryToken(QuestionEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated list with default parameters', async () => {
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(`q-${i}`, {
          topic: Math.floor(i / 5) + 1,
          questionNumber: i + 1,
        }),
      );

      questionsRepo.findAndCount.mockResolvedValue([questions, 100]);

      const result = await controller.list(undefined, undefined);

      expect(result.total).toBe(100);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.items).toHaveLength(20);
    });

    it('should return paginated list with custom limit and offset', async () => {
      const questions = Array.from({ length: 10 }, (_, i) =>
        createMockQuestion(`q-${i + 10}`, {
          topic: 2,
          questionNumber: i + 10,
        }),
      );

      questionsRepo.findAndCount.mockResolvedValue([questions, 100]);

      const result = await controller.list(10, 10);

      expect(result.total).toBe(100);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(10);
      expect(result.items).toHaveLength(10);
    });

    it('should enforce maximum limit of 100', async () => {
      const questions = Array.from({ length: 100 }, (_, i) =>
        createMockQuestion(`q-${i}`),
      );

      questionsRepo.findAndCount.mockResolvedValue([questions, 500]);

      const result = await controller.list(200, 0);

      expect(result.limit).toBe(100);
      expect(questionsRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });

    it('should enforce minimum limit of 1', async () => {
      const questions = [createMockQuestion('q-1')];

      questionsRepo.findAndCount.mockResolvedValue([questions, 50]);

      const result = await controller.list(0, 0);

      expect(result.limit).toBe(1);
      expect(questionsRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ take: 1 }),
      );
    });

    it('should enforce minimum offset of 0', async () => {
      const questions = [createMockQuestion('q-1')];

      questionsRepo.findAndCount.mockResolvedValue([questions, 50]);

      const result = await controller.list(1, -10);

      expect(result.offset).toBe(0);
      expect(questionsRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0 }),
      );
    });

    it('should only return active questions', async () => {
      const questions = [createMockQuestion('q-1')];

      questionsRepo.findAndCount.mockResolvedValue([questions, 10]);

      await controller.list(undefined, undefined);

      expect(questionsRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });

    it('should order by topic and questionNumber ascending', async () => {
      questionsRepo.findAndCount.mockResolvedValue([[], 0]);

      await controller.list(undefined, undefined);

      expect(questionsRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { topic: 'ASC', questionNumber: 'ASC' },
        }),
      );
    });

    it('should handle empty result', async () => {
      questionsRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await controller.list(undefined, undefined);

      expect(result.total).toBe(0);
      expect(result.items).toEqual([]);
    });

    it('should handle last page with fewer items', async () => {
      const questions = Array.from({ length: 5 }, (_, i) =>
        createMockQuestion(`q-${i + 95}`),
      );

      questionsRepo.findAndCount.mockResolvedValue([questions, 100]);

      const result = await controller.list(10, 95);

      expect(result.items).toHaveLength(5);
      expect(result.total).toBe(100);
    });

    it('should handle offset beyond total count', async () => {
      questionsRepo.findAndCount.mockResolvedValue([[], 50]);

      const result = await controller.list(10, 100);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(50);
    });

    it('should return complete question structure', async () => {
      const question = createMockQuestion('complete-q', {
        stem: 'Complete question stem',
        choices: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
        answer: 'C',
        conceptKey: 'api-gateway',
        domainKey: 'development',
        frExplanation: 'Detailed French explanation',
        sourceUrl: 'https://docs.aws.amazon.com',
        textHash: 'uniquehash123',
        isActive: true,
      });

      questionsRepo.findAndCount.mockResolvedValue([[question], 1]);

      const result = await controller.list(1, 0);

      const item = result.items[0];
      expect(item.id).toBe('complete-q');
      expect(item.stem).toBe('Complete question stem');
      expect(item.choices).toEqual({
        A: 'Option A',
        B: 'Option B',
        C: 'Option C',
        D: 'Option D',
      });
      expect(item.answer).toBe('C');
      expect(item.conceptKey).toBe('api-gateway');
      expect(item.domainKey).toBe('development');
      expect(item.frExplanation).toBe('Detailed French explanation');
      expect(item.sourceUrl).toBe('https://docs.aws.amazon.com');
      expect(item.textHash).toBe('uniquehash123');
      expect(item.isActive).toBe(true);
    });

    it('should handle limit at boundary (100)', async () => {
      const questions = Array.from({ length: 100 }, (_, i) =>
        createMockQuestion(`boundary-${i}`),
      );

      questionsRepo.findAndCount.mockResolvedValue([questions, 200]);

      const result = await controller.list(100, 0);

      expect(result.limit).toBe(100);
      expect(result.items).toHaveLength(100);
    });

    it('should handle limit at boundary (1)', async () => {
      const questions = [createMockQuestion('single')];

      questionsRepo.findAndCount.mockResolvedValue([questions, 50]);

      const result = await controller.list(1, 0);

      expect(result.limit).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should order questions correctly by topic', async () => {
      const questions = [
        createMockQuestion('topic1-q1', { topic: 1, questionNumber: 1 }),
        createMockQuestion('topic1-q2', { topic: 1, questionNumber: 2 }),
        createMockQuestion('topic2-q1', { topic: 2, questionNumber: 1 }),
      ];

      questionsRepo.findAndCount.mockResolvedValue([questions, 3]);

      await controller.list(undefined, undefined);

      expect(questionsRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { topic: 'ASC', questionNumber: 'ASC' },
        }),
      );
    });

    it('should handle questions from multiple domains', async () => {
      const questions = [
        createMockQuestion('dev-1', { domainKey: 'development' }),
        createMockQuestion('sec-1', { domainKey: 'security' }),
        createMockQuestion('dep-1', { domainKey: 'deployment' }),
        createMockQuestion('trb-1', { domainKey: 'troubleshooting' }),
      ];

      questionsRepo.findAndCount.mockResolvedValue([questions, 4]);

      const result = await controller.list(10, 0);

      const domains = result.items.map((q) => q.domainKey);
      expect(domains).toContain('development');
      expect(domains).toContain('security');
      expect(domains).toContain('deployment');
      expect(domains).toContain('troubleshooting');
    });

    it('should not return inactive questions', async () => {
      questionsRepo.findAndCount.mockResolvedValue([[], 0]);

      await controller.list(undefined, undefined);

      expect(questionsRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      const page1 = Array.from({ length: 10 }, (_, i) =>
        createMockQuestion(`page1-${i}`, { questionNumber: i + 1 }),
      );
      const page2 = Array.from({ length: 10 }, (_, i) =>
        createMockQuestion(`page2-${i}`, { questionNumber: i + 11 }),
      );

      questionsRepo.findAndCount
        .mockResolvedValueOnce([page1, 25])
        .mockResolvedValueOnce([page2, 25]);

      const result1 = await controller.list(10, 0);
      const result2 = await controller.list(10, 10);

      expect(result1.items[0].questionNumber).toBe(1);
      expect(result2.items[0].questionNumber).toBe(11);
    });

    it('should calculate correct pagination for middle page', async () => {
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(`mid-${i}`, { questionNumber: i + 21 }),
      );

      questionsRepo.findAndCount.mockResolvedValue([questions, 100]);

      const result = await controller.list(20, 20);

      expect(result.limit).toBe(20);
      expect(result.offset).toBe(20);
      expect(result.items[0].questionNumber).toBe(21);
    });

    it('should handle very large total count', async () => {
      const questions = Array.from({ length: 20 }, (_, i) =>
        createMockQuestion(`large-${i}`),
      );

      questionsRepo.findAndCount.mockResolvedValue([questions, 10000]);

      const result = await controller.list(undefined, undefined);

      expect(result.total).toBe(10000);
      expect(result.items).toHaveLength(20);
    });

    it('should preserve all question properties in response', async () => {
      const question = createMockQuestion('full-props');
      questionsRepo.findAndCount.mockResolvedValue([[question], 1]);

      const result = await controller.list(1, 0);

      const item = result.items[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('exam');
      expect(item).toHaveProperty('topic');
      expect(item).toHaveProperty('questionNumber');
      expect(item).toHaveProperty('stem');
      expect(item).toHaveProperty('choices');
      expect(item).toHaveProperty('answer');
      expect(item).toHaveProperty('conceptKey');
      expect(item).toHaveProperty('domainKey');
      expect(item).toHaveProperty('frExplanation');
      expect(item).toHaveProperty('sourceUrl');
      expect(item).toHaveProperty('textHash');
      expect(item).toHaveProperty('isActive');
      expect(item).toHaveProperty('createdAt');
      expect(item).toHaveProperty('updatedAt');
    });
  });
});
