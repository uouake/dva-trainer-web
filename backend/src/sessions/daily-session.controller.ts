import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

// Daily routine endpoints (MVP)
//
// For now we only implement "start a daily session": return N questions.
// Later this will become adaptive (spaced repetition, weaknesses, etc.).

class StartDailySessionDto {
  // How many questions to serve.
  // We keep it small for the "20min/day" workflow.
  limit?: number;
}

@Controller('api/daily-session')
export class DailySessionController {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionsRepo: Repository<QuestionEntity>,
  ) {}

  @Post('start')
  async start(@Body() body: StartDailySessionDto) {
    const limit = Math.max(1, Math.min(body.limit ?? 10, 25));

    // MVP: just take the first N active questions ordered by topic/questionNumber.
    // Later: pick due questions + weaknesses + exploration.
    const items = await this.questionsRepo.find({
      where: { isActive: true },
      order: { topic: 'ASC', questionNumber: 'ASC' },
      take: limit,
    });

    return {
      mode: 'daily',
      limit,
      items,
    };
  }
}
