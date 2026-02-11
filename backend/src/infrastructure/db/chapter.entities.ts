import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

// ChapterEntity
//
// Stocke les chapitres de l'histoire manga AWS pour l'onboarding.
// Chaque chapitre contient du contenu markdown et est associé à des concepts AWS.

@Entity({ name: 'chapters' })
export class ChapterEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Numéro du chapitre (0 = Prologue, 1-5 = Chapitres, 6 = Épilogue)
  @Index()
  @Column({ type: 'int', unique: true })
  number!: number;

  // Titre du chapitre
  @Column({ type: 'text' })
  title!: string;

  // Contenu en markdown
  @Column({ type: 'text' })
  content!: string;

  // Clés des concepts AWS associés (pour filtrer les questions)
  @Column({ type: 'text', array: true, default: [] })
  conceptKeys!: string[];

  // Ordre d'affichage
  @Column({ type: 'int', default: 0 })
  order!: number;

  // Type de chapitre
  @Column({ type: 'text', default: 'chapter' }) // 'prologue' | 'chapter' | 'epilogue'
  type!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

// UserChapterProgressEntity
//
// Stocke la progression de lecture des chapitres par utilisateur.

@Entity({ name: 'user_chapter_progress' })
@Index(['userId', 'chapterId'], { unique: true })
export class UserChapterProgressEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'chapter_id', type: 'uuid' })
  chapterId!: string;

  // Date de complétion
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  // Score du quiz (0-100, null si pas fait)
  @Column({ name: 'quiz_score', type: 'int', nullable: true })
  quizScore!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => ChapterEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chapter_id' })
  chapter!: ChapterEntity;
}
