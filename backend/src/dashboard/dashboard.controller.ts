import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttemptEntity } from '../infrastructure/db/attempt.entity';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

// Dashboard stats endpoint (MVP)
//
// Provides basic KPIs for one user.
// Later we will add:
// - domain breakdown
// - streak
// - spaced repetition queue

@Controller('api/dashboard')
export class DashboardController {
  constructor(
    @InjectRepository(AttemptEntity)
    private readonly attemptsRepo: Repository<AttemptEntity>,
    @InjectRepository(QuestionEntity)
    private readonly questionsRepo: Repository<QuestionEntity>,
  ) {}

  private validateUserId(userId: string) {
    if (!userId) {
      throw new BadRequestException('Missing userId');
    }

    const uuidOk = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      userId,
    );
    if (!uuidOk) {
      throw new BadRequestException('Invalid userId (expected UUID)');
    }
  }

  @Get('overview')
  async overview(@Query('userId') userId: string) {
    this.validateUserId(userId);

    const totalAttempts = await this.attemptsRepo.count({ where: { userId } });
    const correctAttempts = await this.attemptsRepo.count({ where: { userId, isCorrect: true } });

    // Distinct practiced questions
    const practiced = await this.attemptsRepo
      .createQueryBuilder('a')
      .select('COUNT(DISTINCT a.questionId)', 'count')
      .where('a.userId = :userId', { userId })
      .getRawOne<{ count: string }>();

    // Weak concepts: group incorrect attempts by question.conceptKey
    const weak = await this.attemptsRepo
      .createQueryBuilder('a')
      .innerJoin(QuestionEntity, 'q', 'q.id = a.questionId')
      .select('q.conceptKey', 'conceptKey')
      .addSelect('COUNT(*)', 'wrongCount')
      .where('a.userId = :userId', { userId })
      .andWhere('a.isCorrect = false')
      .groupBy('q.conceptKey')
      // Postgres folds unquoted identifiers to lowercase; ordering by the alias can break.
      // Order by the aggregate expression instead.
      .orderBy('COUNT(*)', 'DESC')
      .limit(5)
      .getRawMany<{ conceptKey: string; wrongCount: string }>();

    const successRate = totalAttempts ? Math.round((correctAttempts / totalAttempts) * 100) : null;

    return {
      ok: true,
      totalAttempts,
      correctAttempts,
      successRate,
      questionsPracticed: Number(practiced?.count ?? 0),
      weakConcepts: weak.map((w) => ({
        conceptKey: w.conceptKey,
        wrongCount: Number(w.wrongCount),
      })),
    };
  }

  @Get('domains')
  async domains(@Query('userId') userId: string) {
    this.validateUserId(userId);

    // Aggregate attempts by question.domainKey
    const rows = await this.attemptsRepo
      .createQueryBuilder('a')
      .innerJoin(QuestionEntity, 'q', 'q.id = a.questionId')
      .select('q.domainKey', 'domainKey')
      .addSelect('COUNT(*)', 'attempts')
      .addSelect('SUM(CASE WHEN a.isCorrect THEN 1 ELSE 0 END)', 'correct')
      .where('a.userId = :userId', { userId })
      .groupBy('q.domainKey')
      .orderBy('q.domainKey', 'ASC')
      .getRawMany<{ domainKey: string; attempts: string; correct: string }>();

    const items = rows.map((r) => {
      const attempts = Number(r.attempts);
      const correct = Number(r.correct);
      const successRate = attempts ? Math.round((correct / attempts) * 100) : null;
      return {
        domainKey: r.domainKey ?? 'unknown',
        attempts,
        correct,
        successRate,
      };
    });

    return { ok: true, items } as const;
  }
}
