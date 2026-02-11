import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { makeTypeOrmOptions } from './infrastructure/db/typeorm.config';
import { QuestionEntity, UserEntity } from './infrastructure/db/typeorm.entities';
import { AttemptEntity } from './infrastructure/db/attempt.entity';
import { ChapterEntity, UserChapterProgressEntity } from './infrastructure/db/chapter.entities';
import { FlashcardEntity, FlashcardProgressEntity } from './infrastructure/db/flashcard.entities';
import { HealthController } from './health/health.controller';
import { QuestionsController } from './questions/questions.controller';
import { DailySessionController } from './sessions/daily-session.controller';
import { ExamController } from './exams/exam.controller';
import { AttemptsController } from './attempts/attempts.controller';
import { DashboardController } from './dashboard/dashboard.controller';
import { AuthModule } from './auth/auth.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { OnboardingController } from './onboarding/onboarding.controller';
import { FlashcardsModule } from './flashcards/flashcards.module';

// Root module.
//
// In NestJS, modules group providers/controllers.
// We keep infrastructure configuration here (TypeORM), but *domain* logic stays
// in dedicated modules later.

@Module({
  imports: [
    // 1) Database connection (Postgres)
    TypeOrmModule.forRootAsync({
      useFactory: () => makeTypeOrmOptions(),
    }),

    // 2) Which entities are available for injection as repositories.
    TypeOrmModule.forFeature([QuestionEntity, AttemptEntity, UserEntity, ChapterEntity, UserChapterProgressEntity, FlashcardEntity, FlashcardProgressEntity]),

    // 3) Authentication module
    AuthModule,

    // 4) Onboarding module (histoire manga AWS)
    OnboardingModule,

    // 5) Flashcards module (révision des concepts DVA)
    FlashcardsModule,
  ],
  controllers: [
    AppController,
    HealthController,
    QuestionsController,
    DailySessionController,
    ExamController,
    AttemptsController,
    DashboardController,
    OnboardingController,
  ],
  providers: [AppService],
})
export class AppModule {}
