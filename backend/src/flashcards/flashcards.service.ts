import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashcardEntity, FlashcardProgressEntity } from '../infrastructure/db/flashcard.entities';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(FlashcardEntity)
    private flashcardRepo: Repository<FlashcardEntity>,
    @InjectRepository(FlashcardProgressEntity)
    private progressRepo: Repository<FlashcardProgressEntity>,
  ) {}

  async findAll(): Promise<FlashcardEntity[]> {
    return this.flashcardRepo.find({ order: { category: 'ASC', conceptKey: 'ASC' } });
  }

  async findRandom(count: number, userId: string): Promise<FlashcardEntity[]> {
    // Get IDs of cards already reviewed by user
    const reviewedIds = await this.progressRepo
      .createQueryBuilder('p')
      .select('p.flashcardId')
      .where('p.userId = :userId', { userId })
      .andWhere('p.known = true')
      .getRawMany();
    
    const reviewedIdList = reviewedIds.map(r => r.flashcardId);
    
    // Get random cards, prioritizing unreviewed ones
    const query = this.flashcardRepo.createQueryBuilder('f')
      .orderBy('RANDOM()')
      .limit(count);
    
    if (reviewedIdList.length > 0) {
      query.where('f.id NOT IN (:...reviewedIdList)', { reviewedIdList });
    }
    
    let cards = await query.getMany();
    
    // If not enough unreviewed cards, fill with random reviewed ones
    if (cards.length < count) {
      const additionalCards = await this.flashcardRepo
        .createQueryBuilder('f')
        .orderBy('RANDOM()')
        .limit(count - cards.length)
        .getMany();
      cards = [...cards, ...additionalCards];
    }
    
    return cards.slice(0, count);
  }

  async saveProgress(userId: string, flashcardId: string, known: boolean): Promise<void> {
    let progress = await this.progressRepo.findOne({
      where: { userId, flashcardId },
    });

    if (progress) {
      progress.known = known;
      progress.reviewCount += 1;
      progress.lastReviewedAt = new Date();
    } else {
      progress = this.progressRepo.create({
        userId,
        flashcardId,
        known,
        reviewCount: 1,
        lastReviewedAt: new Date(),
      });
    }

    await this.progressRepo.save(progress);
  }

  async getStats(userId: string): Promise<any> {
    const totalFlashcards = await this.flashcardRepo.count();
    const progressRecords = await this.progressRepo.find({ where: { userId } });
    
    const knownFlashcards = progressRecords.filter(p => p.known).length;
    const toReviewFlashcards = progressRecords.filter(p => !p.known).length;
    const reviewedFlashcards = progressRecords.length;
    
    return {
      totalFlashcards,
      reviewedFlashcards,
      knownFlashcards,
      toReviewFlashcards,
      progressPercentage: totalFlashcards > 0 ? Math.round((reviewedFlashcards / totalFlashcards) * 100) : 0,
      streakDays: 0, // TODO: Calculate streak
      lastStudyDate: progressRecords.length > 0 
        ? progressRecords
            .filter(p => p.lastReviewedAt)
            .sort((a, b) => b.lastReviewedAt!.getTime() - a.lastReviewedAt!.getTime())[0]?.lastReviewedAt ?? null
        : null,
    };
  }
}
