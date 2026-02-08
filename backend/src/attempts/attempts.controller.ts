import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttemptEntity, AttemptMode } from '../infrastructure/db/attempt.entity';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

// Attempts API
//
// This endpoint is the foundation for real progress tracking.
// The frontend sends each answer attempt.

class CreateAttemptDto {
  userId!: string;
  questionId!: string;
  mode!: AttemptMode;
  selectedChoice!: string;
}

@Controller('api/attempts')
export class AttemptsController {
  constructor(
    @InjectRepository(AttemptEntity)
    private readonly attemptsRepo: Repository<AttemptEntity>,
    @InjectRepository(QuestionEntity)
    private readonly questionsRepo: Repository<QuestionEntity>,
  ) {}

  @Post()
  async create(@Body() dto: CreateAttemptDto) {
    // Minimal validation.
    if (!dto.userId || !dto.questionId || !dto.mode || !dto.selectedChoice) {
      return { ok: false, error: 'Missing fields' };
    }

    const q = await this.questionsRepo.findOne({ where: { id: dto.questionId } });
    if (!q) {
      return { ok: false, error: 'Unknown questionId' };
    }

    const attempt = new AttemptEntity();
    attempt.userId = dto.userId;
    attempt.questionId = dto.questionId;
    attempt.mode = dto.mode;
    attempt.selectedChoice = dto.selectedChoice;
    attempt.isCorrect = dto.selectedChoice === q.answer;

    const saved = await this.attemptsRepo.save(attempt);

    return {
      ok: true,
      attemptId: saved.id,
      isCorrect: saved.isCorrect,
      correctAnswer: q.answer,
    };
  }
}
