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

    // V1 local: randomize question order.
    // Later: domain distribution + avoid repeats across exams.
    const items = await this.questionsRepo
      .createQueryBuilder('q')
      .where('q.isActive = true')
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();

    return {
      mode: 'exam',
      count,
      durationMinutes: 130,
      items,
    };
  }
}
