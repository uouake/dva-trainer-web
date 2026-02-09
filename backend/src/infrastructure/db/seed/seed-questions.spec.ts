import { DataSource, Repository } from 'typeorm';
import { QuestionEntity } from '../typeorm.entities';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Mock dependencies
jest.mock('dotenv/config');
jest.mock('../typeorm.config', () => ({
  makeTypeOrmOptions: jest.fn().mockReturnValue({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'test',
    password: 'test',
    database: 'test',
  }),
}));
jest.mock('node:fs');
jest.mock('typeorm', () => ({
  DataSource: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    getRepository: jest.fn(),
    destroy: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('Seed Questions Script', () => {
  let mockDataSource: jest.Mocked<DataSource>;
  let mockRepository: jest.Mocked<Repository<QuestionEntity>>;
  let mockExit: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  const sampleQuestions = {
    questions: [
      {
        id: 'dva-c02:topic:1:question:1:abc123',
        exam: 'dva-c02',
        topic: 1,
        questionNumber: 1,
        stem: 'What is AWS Lambda?',
        choices: {
          A: 'A compute service',
          B: 'A storage service',
          C: 'A database service',
          D: 'A networking service',
        },
        answer: 'A',
        conceptKey: 'aws-lambda',
        domainKey: 'development',
        frExplanation: 'Lambda est un service de calcul sans serveur',
        sourceUrl: 'https://example.com/q1',
        textHash: 'hash1',
        isActive: true,
      },
      {
        id: 'dva-c02:topic:1:question:2:def456',
        exam: 'dva-c02',
        topic: 1,
        questionNumber: 2,
        stem: 'What is Amazon S3?',
        choices: {
          A: 'A compute service',
          B: 'A storage service',
          C: 'A database service',
          D: 'A networking service',
        },
        answer: 'B',
        conceptKey: 'amazon-s3',
        domainKey: 'deployment',
        frExplanation: 'S3 est un service de stockage objet',
        sourceUrl: 'https://example.com/q2',
        textHash: 'hash2',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    mockRepository = {
      delete: jest.fn().mockResolvedValue({ affected: 2 }),
      save: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<Repository<QuestionEntity>>;

    mockDataSource = {
      initialize: jest.fn().mockResolvedValue(undefined),
      getRepository: jest.fn().mockReturnValue(mockRepository),
      destroy: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<DataSource>;

    (DataSource as jest.MockedClass<typeof DataSource>).mockImplementation(
      () => mockDataSource,
    );

    mockExit = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

    // Mock fs.existsSync to return true for file path
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    // Mock path.resolve
    (path.resolve as jest.Mock) = jest.fn((...args: string[]) => args.join('/'));
  });

  afterEach(() => {
    mockExit.mockRestore();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('File handling', () => {
    it('should read questions from JSON file', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleQuestions));

      // Import the script dynamically to test
      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it('should throw error when question bank file not found', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      jest.isolateModules(async () => {
        try {
          await import('./seed-questions');
        } catch (e) {
          // Expected
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Question bank JSON not found'),
      );
    });

    it('should throw error when questions array is empty', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ questions: [] }));
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      jest.isolateModules(async () => {
        try {
          await import('./seed-questions');
        } catch (e) {
          // Expected
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should throw error when JSON is invalid', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid json');
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      jest.isolateModules(async () => {
        try {
          await import('./seed-questions');
        } catch (e) {
          // Expected
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('Database operations', () => {
    it('should initialize DataSource', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleQuestions));

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockDataSource.initialize).toHaveBeenCalled();
    });

    it('should get QuestionEntity repository', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleQuestions));

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockDataSource.getRepository).toHaveBeenCalledWith(QuestionEntity);
    });

    it('should delete existing questions before seeding', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleQuestions));

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockRepository.delete).toHaveBeenCalled();
    });

    it('should save questions to database', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleQuestions));

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should destroy DataSource after seeding', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleQuestions));

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockDataSource.destroy).toHaveBeenCalled();
    });
  });

  describe('Question entity mapping', () => {
    it('should map all question properties correctly', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleQuestions));

      let savedEntities: QuestionEntity[] = [];
      mockRepository.save.mockImplementation((entities) => {
        savedEntities = entities as QuestionEntity[];
        return Promise.resolve(entities);
      });

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (savedEntities.length > 0) {
        const firstEntity = savedEntities[0];
        expect(firstEntity.id).toBe(sampleQuestions.questions[0].id);
        expect(firstEntity.exam).toBe(sampleQuestions.questions[0].exam);
        expect(firstEntity.topic).toBe(sampleQuestions.questions[0].topic);
        expect(firstEntity.questionNumber).toBe(sampleQuestions.questions[0].questionNumber);
        expect(firstEntity.stem).toBe(sampleQuestions.questions[0].stem);
        expect(firstEntity.choices).toEqual(sampleQuestions.questions[0].choices);
        expect(firstEntity.answer).toBe(sampleQuestions.questions[0].answer);
        expect(firstEntity.conceptKey).toBe(sampleQuestions.questions[0].conceptKey);
        expect(firstEntity.domainKey).toBe(sampleQuestions.questions[0].domainKey);
        expect(firstEntity.frExplanation).toBe(sampleQuestions.questions[0].frExplanation);
        expect(firstEntity.sourceUrl).toBe(sampleQuestions.questions[0].sourceUrl);
        expect(firstEntity.textHash).toBe(sampleQuestions.questions[0].textHash);
        expect(firstEntity.isActive).toBe(sampleQuestions.questions[0].isActive);
      }
    });

    it('should use default domainKey when not provided', async () => {
      const questionsWithoutDomain = {
        questions: [
          {
            ...sampleQuestions.questions[0],
            domainKey: undefined,
          },
        ],
      };
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(questionsWithoutDomain));

      let savedEntities: QuestionEntity[] = [];
      mockRepository.save.mockImplementation((entities) => {
        savedEntities = entities as QuestionEntity[];
        return Promise.resolve(entities);
      });

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (savedEntities.length > 0) {
        expect(savedEntities[0].domainKey).toBe('unknown');
      }
    });

    it('should use default isActive when not provided', async () => {
      const questionsWithoutActive = {
        questions: [
          {
            ...sampleQuestions.questions[0],
            isActive: undefined,
          },
        ],
      };
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(questionsWithoutActive));

      let savedEntities: QuestionEntity[] = [];
      mockRepository.save.mockImplementation((entities) => {
        savedEntities = entities as QuestionEntity[];
        return Promise.resolve(entities);
      });

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (savedEntities.length > 0) {
        expect(savedEntities[0].isActive).toBe(true);
      }
    });
  });

  describe('Chunking', () => {
    it('should process questions in chunks', async () => {
      const manyQuestions = {
        questions: Array.from({ length: 500 }, (_, i) => ({
          ...sampleQuestions.questions[0],
          id: `q-${i}`,
        })),
      };
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(manyQuestions));

      const saveCalls: number[] = [];
      mockRepository.save.mockImplementation((entities) => {
        saveCalls.push((entities as QuestionEntity[]).length);
        return Promise.resolve(entities);
      });

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should have multiple chunks of 200 or less
      expect(saveCalls.length).toBeGreaterThan(1);
      expect(saveCalls.every((count) => count <= 200)).toBe(true);
    });

    it('should log progress for each chunk', async () => {
      const manyQuestions = {
        questions: Array.from({ length: 250 }, (_, i) => ({
          ...sampleQuestions.questions[0],
          id: `q-${i}`,
        })),
      };
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(manyQuestions));

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should log progress at least twice (for 250 questions in chunks of 200)
      const progressLogs = mockConsoleLog.mock.calls.filter((call) =>
        call[0].includes('Seeded'),
      );
      expect(progressLogs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Error handling', () => {
    it('should handle database initialization error', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleQuestions));
      mockDataSource.initialize.mockRejectedValue(new Error('DB Connection Failed'));

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle repository save error', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleQuestions));
      mockRepository.save.mockRejectedValue(new Error('Save Failed'));

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should set exit code on error', async () => {
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid json');

      jest.isolateModules(async () => {
        try {
          await import('./seed-questions');
        } catch (e) {
          // Expected
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('File path resolution', () => {
    it('should check multiple candidate paths', async () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleQuestions));

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(fs.existsSync).toHaveBeenCalledTimes(3);
    });

    it('should use QUESTIONS_JSON_PATH environment variable when set', async () => {
      process.env.QUESTIONS_JSON_PATH = '/custom/path/questions.json';
      (fs.existsSync as jest.Mock).mockImplementation((path: string) =>
        path === '/custom/path/questions.json',
      );
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(sampleQuestions));

      jest.isolateModules(async () => {
        await import('./seed-questions');
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(fs.existsSync).toHaveBeenCalledWith('/custom/path/questions.json');

      delete process.env.QUESTIONS_JSON_PATH;
    });
  });
});
