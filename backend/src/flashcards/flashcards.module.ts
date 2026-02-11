import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';
import { FlashcardEntity, FlashcardProgressEntity } from '../infrastructure/db/flashcard.entities';

@Module({
  imports: [TypeOrmModule.forFeature([FlashcardEntity, FlashcardProgressEntity])],
  controllers: [FlashcardsController],
  providers: [FlashcardsService],
})
export class FlashcardsModule {}
