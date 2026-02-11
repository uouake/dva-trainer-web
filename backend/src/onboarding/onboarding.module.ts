import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import {
  ChapterEntity,
  UserChapterProgressEntity,
} from '../infrastructure/db/chapter.entities';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

// OnboardingModule
//
// Module pour l'histoire manga AWS (onboarding interactif).
// Gère les chapitres, la progression utilisateur et les quiz.

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChapterEntity,
      UserChapterProgressEntity,
      QuestionEntity,
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
