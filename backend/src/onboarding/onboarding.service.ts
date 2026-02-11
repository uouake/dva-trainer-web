import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  ChapterEntity,
  UserChapterProgressEntity,
} from '../infrastructure/db/chapter.entities';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

export interface ChapterListItem {
  id: string;
  number: number;
  title: string;
  type: string;
  completed: boolean;
  quizScore: number | null;
}

export interface ChapterDetail extends ChapterListItem {
  content: string;
  conceptKeys: string[];
}

export interface UserProgress {
  totalChapters: number;
  completedChapters: number;
  progressPercentage: number;
  chapters: ChapterListItem[];
}

export interface QuizQuestion {
  id: string;
  stem: string;
  choices: Record<string, string>;
  answer: string;
  requiredAnswers: number;
  conceptKey: string;
}

export interface MarkProgressDto {
  chapterId: string;
  quizScore?: number;
}

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(ChapterEntity)
    private readonly chapterRepo: Repository<ChapterEntity>,
    @InjectRepository(UserChapterProgressEntity)
    private readonly progressRepo: Repository<UserChapterProgressEntity>,
    @InjectRepository(QuestionEntity)
    private readonly questionRepo: Repository<QuestionEntity>,
  ) {}

  /**
   * Liste tous les chapitres avec indication de progression pour l'utilisateur
   */
  async listChapters(userId: string): Promise<ChapterListItem[]> {
    const chapters = await this.chapterRepo.find({
      order: { order: 'ASC', number: 'ASC' },
    });

    const progress = await this.progressRepo.find({
      where: { userId },
    });

    const progressMap = new Map(progress.map((p) => [p.chapterId, p]));

    return chapters.map((chapter) => {
      const userProgress = progressMap.get(chapter.id);
      return {
        id: chapter.id,
        number: chapter.number,
        title: chapter.title,
        type: chapter.type,
        completed: !!userProgress?.completedAt,
        quizScore: userProgress?.quizScore ?? null,
      };
    });
  }

  /**
   * Récupère le détail d'un chapitre
   */
  async getChapter(userId: string, chapterId: string): Promise<ChapterDetail> {
    const chapter = await this.chapterRepo.findOne({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('Chapitre non trouvé');
    }

    const progress = await this.progressRepo.findOne({
      where: { userId, chapterId },
    });

    return {
      id: chapter.id,
      number: chapter.number,
      title: chapter.title,
      type: chapter.type,
      content: chapter.content,
      conceptKeys: chapter.conceptKeys,
      completed: !!progress?.completedAt,
      quizScore: progress?.quizScore ?? null,
    };
  }

  /**
   * Récupère un chapitre par son numéro
   */
  async getChapterByNumber(
    userId: string,
    number: number,
  ): Promise<ChapterDetail | null> {
    const chapter = await this.chapterRepo.findOne({
      where: { number },
    });

    if (!chapter) {
      return null;
    }

    return this.getChapter(userId, chapter.id);
  }

  /**
   * Récupère la progression globale de l'utilisateur
   */
  async getUserProgress(userId: string): Promise<UserProgress> {
    const [chapters, total] = await this.chapterRepo.findAndCount({
      order: { order: 'ASC' },
    });

    const progress = await this.progressRepo.find({
      where: { userId },
    });

    const progressMap = new Map(progress.map((p) => [p.chapterId, p]));
    const completedCount = progress.filter((p) => p.completedAt).length;

    const chapterItems = chapters.map((chapter) => {
      const userProgress = progressMap.get(chapter.id);
      return {
        id: chapter.id,
        number: chapter.number,
        title: chapter.title,
        type: chapter.type,
        completed: !!userProgress?.completedAt,
        quizScore: userProgress?.quizScore ?? null,
      };
    });

    return {
      totalChapters: total,
      completedChapters: completedCount,
      progressPercentage: total > 0 ? Math.round((completedCount / total) * 100) : 0,
      chapters: chapterItems,
    };
  }

  /**
   * Marque un chapitre comme lu et/ou enregistre le score du quiz
   */
  async markProgress(
    userId: string,
    dto: MarkProgressDto,
  ): Promise<UserChapterProgressEntity> {
    const { chapterId, quizScore } = dto;

    // Vérifier que le chapitre existe
    const chapter = await this.chapterRepo.findOne({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('Chapitre non trouvé');
    }

    // Chercher ou créer la progression
    let progress = await this.progressRepo.findOne({
      where: { userId, chapterId },
    });

    if (!progress) {
      progress = this.progressRepo.create({
        userId,
        chapterId,
      });
    }

    // Marquer comme complété si ce n'est pas déjà fait
    if (!progress.completedAt) {
      progress.completedAt = new Date();
    }

    // Mettre à jour le score du quiz si fourni
    if (quizScore !== undefined) {
      progress.quizScore = Math.max(0, Math.min(100, quizScore));
    }

    return this.progressRepo.save(progress);
  }

  /**
   * Génère un quiz de 5 questions aléatoires basées sur les concepts du chapitre
   */
  async getChapterQuiz(
    userId: string,
    chapterId: string,
  ): Promise<QuizQuestion[]> {
    // Vérifier que le chapitre existe
    const chapter = await this.chapterRepo.findOne({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('Chapitre non trouvé');
    }

    // Si pas de concepts associés, retourner un tableau vide
    if (!chapter.conceptKeys || chapter.conceptKeys.length === 0) {
      return [];
    }

    // Récupérer les questions liées aux concepts du chapitre
    const questions = await this.questionRepo.find({
      where: {
        conceptKey: In(chapter.conceptKeys),
        isActive: true,
      },
    });

    // Mélanger et prendre 5 questions maximum
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    return selected.map((q) => ({
      id: q.id,
      stem: q.stem,
      choices: q.choices,
      answer: q.answer,
      requiredAnswers: q.requiredAnswers,
      conceptKey: q.conceptKey,
    }));
  }

  /**
   * Récupère les chapitres précédent et suivant
   */
  async getAdjacentChapters(
    userId: string,
    chapterId: string,
  ): Promise<{ previous: ChapterListItem | null; next: ChapterListItem | null }> {
    const chapter = await this.chapterRepo.findOne({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('Chapitre non trouvé');
    }

    const chapters = await this.listChapters(userId);
    const currentIndex = chapters.findIndex((c) => c.id === chapterId);

    return {
      previous: currentIndex > 0 ? chapters[currentIndex - 1] : null,
      next: currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null,
    };
  }
}
