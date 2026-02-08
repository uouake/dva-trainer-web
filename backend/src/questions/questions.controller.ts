import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

// Questions API (MVP)
//
// For now we expose a simple read-only endpoint.
// Later we'll hide TypeORM behind a repository interface (hexagonal style),
// but for MVP it's fine to keep it direct.

@Controller('api/questions')
export class QuestionsController {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionsRepo: Repository<QuestionEntity>,
  ) {}

  @Get()
  async list(
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
  ) {
    // Guardrails so we don't accidentally fetch huge payloads.
    const safeLimit = Math.max(1, Math.min(limit ?? 20, 100));
    const safeOffset = Math.max(0, offset ?? 0);

    const [items, total] = await this.questionsRepo.findAndCount({
      where: { isActive: true },
      order: { topic: 'ASC', questionNumber: 'ASC' },
      skip: safeOffset,
      take: safeLimit,
    });

    return {
      total,
      limit: safeLimit,
      offset: safeOffset,
      items,
    };
  }
}
