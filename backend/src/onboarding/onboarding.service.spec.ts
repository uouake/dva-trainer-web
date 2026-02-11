import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingService } from './onboarding.service';
import { ChapterEntity, UserChapterProgressEntity } from '../infrastructure/db/chapter.entities';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let chapterRepo: Repository<ChapterEntity>;
  let progressRepo: Repository<UserChapterProgressEntity>;
  let questionRepo: Repository<QuestionEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: getRepositoryToken(ChapterEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserChapterProgressEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(QuestionEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    chapterRepo = module.get<Repository<ChapterEntity>>(getRepositoryToken(ChapterEntity));
    progressRepo = module.get<Repository<UserChapterProgressEntity>>(getRepositoryToken(UserChapterProgressEntity));
    questionRepo = module.get<Repository<QuestionEntity>>(getRepositoryToken(QuestionEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listChapters', () => {
    it('should return chapters with completion status', async () => {
      const mockChapters = [
        { id: '1', number: 0, title: 'Prologue', type: 'prologue', order: 0, content: '', conceptKeys: [] },
        { id: '2', number: 1, title: 'Chapitre 1', type: 'chapter', order: 1, content: '', conceptKeys: [] },
      ] as ChapterEntity[];

      const mockProgress = [
        { id: 'p1', userId: 'user1', chapterId: '1', completedAt: new Date(), quizScore: null },
      ] as UserChapterProgressEntity[];

      jest.spyOn(chapterRepo, 'find').mockResolvedValue(mockChapters);
      jest.spyOn(progressRepo, 'find').mockResolvedValue(mockProgress);

      const result = await service.listChapters('user1');

      expect(result).toHaveLength(2);
      expect(result[0].completed).toBe(true);
      expect(result[1].completed).toBe(false);
    });
  });

  describe('markProgress', () => {
    it('should mark chapter as read', async () => {
      const mockChapter = { id: '1', number: 0, title: 'Prologue' } as ChapterEntity;
      
      jest.spyOn(chapterRepo, 'findOne').mockResolvedValue(mockChapter);
      jest.spyOn(progressRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(progressRepo, 'create').mockReturnValue({
        id: 'p1',
        userId: 'user1',
        chapterId: '1',
        completedAt: null,
        quizScore: null,
      } as UserChapterProgressEntity);
      jest.spyOn(progressRepo, 'save').mockImplementation((entity) => Promise.resolve(entity as UserChapterProgressEntity));

      const result = await service.markProgress('user1', { chapterId: '1' });

      expect(result.completedAt).toBeDefined();
    });

    it('should save quiz score', async () => {
      const mockChapter = { id: '1', number: 0, title: 'Prologue' } as ChapterEntity;
      const existingProgress = {
        id: 'p1',
        userId: 'user1',
        chapterId: '1',
        completedAt: new Date(),
        quizScore: null,
      } as UserChapterProgressEntity;

      jest.spyOn(chapterRepo, 'findOne').mockResolvedValue(mockChapter);
      jest.spyOn(progressRepo, 'findOne').mockResolvedValue(existingProgress);
      jest.spyOn(progressRepo, 'save').mockImplementation((entity) => Promise.resolve(entity as UserChapterProgressEntity));

      const result = await service.markProgress('user1', { chapterId: '1', quizScore: 80 });

      expect(result.quizScore).toBe(80);
    });
  });
});
