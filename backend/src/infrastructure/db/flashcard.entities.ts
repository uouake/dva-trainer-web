import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'flashcards' })
export class FlashcardEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true, name: 'concept_key' })
  conceptKey!: string;

  @Column({ type: 'text' })
  front!: string;

  @Column({ type: 'text' })
  back!: string;

  @Column({ type: 'text' })
  category!: string;

  @Column({ type: 'int', default: 1 })
  difficulty!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}

@Entity({ name: 'flashcard_progress' })
export class FlashcardProgressEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', name: 'user_id' })
  userId!: string;

  @Column({ type: 'text', name: 'flashcard_id' })
  flashcardId!: string;

  @Column({ type: 'boolean', default: false })
  known!: boolean;

  @Column({ type: 'int', default: 0, name: 'review_count' })
  reviewCount!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_reviewed_at' })
  lastReviewedAt!: Date | null;
}
