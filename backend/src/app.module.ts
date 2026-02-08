import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { makeTypeOrmOptions } from './infrastructure/db/typeorm.config';
import { QuestionEntity } from './infrastructure/db/typeorm.entities';
import { AttemptEntity } from './infrastructure/db/attempt.entity';
import { HealthController } from './health/health.controller';
import { QuestionsController } from './questions/questions.controller';
import { DailySessionController } from './sessions/daily-session.controller';
import { ExamController } from './exams/exam.controller';
import { AttemptsController } from './attempts/attempts.controller';
import { DashboardController } from './dashboard/dashboard.controller';

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
    TypeOrmModule.forFeature([QuestionEntity, AttemptEntity]),
  ],
  controllers: [
    AppController,
    HealthController,
    QuestionsController,
    DailySessionController,
    ExamController,
    AttemptsController,
    DashboardController,
  ],
  providers: [AppService],
})
export class AppModule {}
