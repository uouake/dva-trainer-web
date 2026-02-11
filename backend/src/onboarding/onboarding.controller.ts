import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';
import type { MarkProgressDto } from './onboarding.service';

// OnboardingController
//
// API pour l'histoire manga AWS (onboarding).
// Toutes les routes sont protégées par JWT.

@Controller('api/onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * GET /api/onboarding/chapters
   * Liste tous les chapitres avec progression utilisateur
   */
  @Get('chapters')
  async listChapters(@Request() req: RequestWithUser) {
    return this.onboardingService.listChapters(req.user.id);
  }

  /**
   * GET /api/onboarding/chapters/:id
   * Détail d'un chapitre
   */
  @Get('chapters/:id')
  async getChapter(
    @Request() req: RequestWithUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) chapterId: string,
  ) {
    const chapter = await this.onboardingService.getChapter(req.user.id, chapterId);
    const adjacent = await this.onboardingService.getAdjacentChapters(
      req.user.id,
      chapterId,
    );
    return { ...chapter, ...adjacent };
  }

  /**
   * GET /api/onboarding/chapters/:id/quiz
   * Quiz de 5 questions pour le chapitre
   */
  @Get('chapters/:id/quiz')
  async getChapterQuiz(
    @Request() req: RequestWithUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) chapterId: string,
  ) {
    const questions = await this.onboardingService.getChapterQuiz(
      req.user.id,
      chapterId,
    );
    return { questions };
  }

  /**
   * POST /api/onboarding/progress
   * Marque un chapitre comme lu et/ou enregistre le score
   */
  @Post('progress')
  async markProgress(
    @Request() req: RequestWithUser,
    @Body() dto: MarkProgressDto,
  ) {
    const progress = await this.onboardingService.markProgress(req.user.id, dto);
    return {
      success: true,
      chapterId: progress.chapterId,
      completedAt: progress.completedAt,
      quizScore: progress.quizScore,
    };
  }

  /**
   * GET /api/onboarding/progress
   * Progression globale de l'utilisateur
   */
  @Get('progress')
  async getUserProgress(@Request() req: RequestWithUser) {
    return this.onboardingService.getUserProgress(req.user.id);
  }
}
