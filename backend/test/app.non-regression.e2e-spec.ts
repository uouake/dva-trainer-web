import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionEntity } from '../src/infrastructure/db/typeorm.entities';
import { Repository } from 'typeorm';

describe('API Non-Regression Tests (e2e)', () => {
  let app: INestApplication;
  let questionsRepo: Repository<QuestionEntity>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    questionsRepo = moduleFixture.get<Repository<QuestionEntity>>(
      getRepositoryToken(QuestionEntity),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/health', () => {
    it('should return {ok: true}', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({ ok: true });
    });
  });

  describe('GET /api/questions', () => {
    it('should return questions with correct structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/questions?limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('offset');
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);

      if (response.body.items.length > 0) {
        const question = response.body.items[0];
        // Champs requis pour chaque question
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('exam');
        expect(question).toHaveProperty('topic');
        expect(question).toHaveProperty('questionNumber');
        expect(question).toHaveProperty('stem');
        expect(question).toHaveProperty('choices');
        expect(question).toHaveProperty('answer');
        expect(question).toHaveProperty('conceptKey');
        expect(question).toHaveProperty('domainKey');
        expect(question).toHaveProperty('frExplanation');
        expect(question).toHaveProperty('sourceUrl');
        expect(question).toHaveProperty('isActive');
      }
    });

    it('should have exactly 557 questions in total', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/questions?limit=1')
        .expect(200);

      expect(response.body.total).toBe(557);
    });

    it('should only return active questions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/questions?limit=100')
        .expect(200);

      const allActive = response.body.items.every((q: QuestionEntity) => q.isActive === true);
      expect(allActive).toBe(true);
    });

    it('should return questions ordered by topic and questionNumber', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/questions?limit=20')
        .expect(200);

      const items = response.body.items;
      for (let i = 1; i < items.length; i++) {
        const prev = items[i - 1];
        const curr = items[i];
        
        if (prev.topic === curr.topic) {
          expect(curr.questionNumber).toBeGreaterThanOrEqual(prev.questionNumber);
        } else {
          expect(curr.topic).toBeGreaterThanOrEqual(prev.topic);
        }
      }
    });
  });

  describe('POST /api/daily-session/start', () => {
    it('should create a daily session with default limit', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/daily-session/start')
        .send({})
        .expect(201);

      expect(response.body).toHaveProperty('mode', 'daily');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.limit).toBe(10); // default
      expect(response.body.items.length).toBeLessThanOrEqual(10);
    });

    it('should create a daily session with custom limit', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/daily-session/start')
        .send({ limit: 5 })
        .expect(201);

      expect(response.body.mode).toBe('daily');
      expect(response.body.limit).toBe(5);
      expect(response.body.items.length).toBeLessThanOrEqual(5);
    });

    it('should enforce max limit of 25', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/daily-session/start')
        .send({ limit: 50 })
        .expect(201);

      expect(response.body.limit).toBe(25);
    });

    it('should enforce min limit of 1', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/daily-session/start')
        .send({ limit: 0 })
        .expect(201);

      expect(response.body.limit).toBe(1);
    });

    it('should return questions with complete structure', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/daily-session/start')
        .send({ limit: 3 })
        .expect(201);

      expect(response.body.items.length).toBeGreaterThan(0);
      
      for (const question of response.body.items) {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('exam');
        expect(question).toHaveProperty('topic');
        expect(question).toHaveProperty('questionNumber');
        expect(question).toHaveProperty('stem');
        expect(question).toHaveProperty('choices');
        expect(typeof question.choices).toBe('object');
        expect(question).toHaveProperty('answer');
        expect(question).toHaveProperty('conceptKey');
        expect(question).toHaveProperty('frExplanation');
      }
    });
  });

  describe('Question structure validation', () => {
    it('should have valid question data types', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/questions?limit=10')
        .expect(200);

      for (const question of response.body.items) {
        expect(typeof question.id).toBe('string');
        expect(typeof question.exam).toBe('string');
        expect(typeof question.topic).toBe('number');
        expect(typeof question.questionNumber).toBe('number');
        expect(typeof question.stem).toBe('string');
        expect(typeof question.choices).toBe('object');
        expect(typeof question.answer).toBe('string');
        expect(typeof question.conceptKey).toBe('string');
        expect(typeof question.isActive).toBe('boolean');
        
        // Choices doit avoir des clés A, B, C, D
        const choiceKeys = Object.keys(question.choices);
        expect(choiceKeys.length).toBeGreaterThanOrEqual(2);
        
        // Vérifier que la réponse existe dans les choices
        expect(question.choices[question.answer]).toBeDefined();
      }
    });

    it('should have valid domains', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/questions?limit=100')
        .expect(200);

      const validDomains = ['development', 'security', 'deployment', 'troubleshooting', 'unknown'];
      
      for (const question of response.body.items) {
        if (question.domainKey) {
          expect(validDomains).toContain(question.domainKey);
        }
      }
    });
  });
});
