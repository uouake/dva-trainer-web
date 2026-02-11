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

  @Column({ type: 'text', unique: true })
  conceptKey!: string;

  @Column({ type: 'text' })
  front!: string;

  @Column({ type: 'text' })
  back!: string;

  @Column({ type: 'text' })
  category!: string;

  @Column({ type: 'int', default: 1 })
  difficulty!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'flashcard_progress' })
export class FlashcardProgressEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  flashcardId!: string;

  @Column({ type: 'boolean', default: false })
  known!: boolean;

  @Column({ type: 'int', default: 0 })
  reviewCount!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastReviewedAt!: Date | null;
}
