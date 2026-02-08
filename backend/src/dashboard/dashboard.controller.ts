import { Controller, Get, Query } from '@nestjs/common';
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

  @Get('overview')
  async overview(@Query('userId') userId: string) {
    if (!userId) {
      return { ok: false, error: 'Missing userId' };
    }

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
      .orderBy('wrongCount', 'DESC')
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
}
