import { Body, Controller, Post, Headers, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';
import { UserEntity } from '../infrastructure/db/user.entity';

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
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  @Post('start')
  async start(
    @Body() body: StartDailySessionDto,
    @Headers('authorization') authHeader?: string,
  ) {
    const limit = Math.max(1, Math.min(body.limit ?? 10, 25));

    // Extract userId from JWT token if present (optional auth)
    let userId: string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = this.jwtService.verify(token);
        // Verify user exists
        const user = await this.userRepo.findOne({ where: { id: payload.sub } });
        if (user) {
          userId = user.id;
        }
      } catch {
        // Invalid token - continue as anonymous
      }
    }

    // V1 local: randomize questions so the routine isn't always the same slice.
    // Later: pick due questions + weaknesses + exploration.
    const items = await this.questionsRepo
      .createQueryBuilder('q')
      .where('q.isActive = true')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();

    return {
      mode: 'daily',
      limit,
      userId: userId || null, // null for anonymous users
      items,
    };
  }
}
