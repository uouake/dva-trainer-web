import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

// Exam endpoints (MVP)
//
// We will later implement:
// - 65 questions
// - timer 130 minutes
// - distribution by domain
// - scored vs unscored questions
//
// For MVP: provide a stable way to start an exam and return 65 questions.

class StartExamDto {
  count?: number;
}

@Controller('api/exams')
export class ExamController {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionsRepo: Repository<QuestionEntity>,
  ) {}

  @Post('start')
  async start(@Body() body: StartExamDto) {
    const count = Math.max(1, Math.min(body.count ?? 65, 65));

    // MVP: pick the first 65 active questions.
    // Later: randomize + domain distribution + avoid repeats.
    const items = await this.questionsRepo.find({
      where: { isActive: true },
      order: { topic: 'ASC', questionNumber: 'ASC' },
      take: count,
    });

    return {
      mode: 'exam',
      count,
      durationMinutes: 130,
      items,
    };
  }
}
