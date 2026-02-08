import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

// AttemptEntity
//
// Stores a single answer attempt by a user.
//
// MVP notes:
// - We do NOT implement authentication yet.
// - The frontend will generate a stable anonymous userId (UUID) and send it.
// - This is enough to compute real progress for one user.

export type AttemptMode = 'daily' | 'exam';

@Entity({ name: 'attempts' })
export class AttemptEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'text' })
  userId!: string;

  @Index()
  @Column({ type: 'text' })
  questionId!: string;

  @Column({ type: 'text' })
  mode!: AttemptMode;

  // Selected answer (e.g. "A").
  @Column({ type: 'text' })
  selectedChoice!: string;

  // Whether the selected choice matched the correct answer at the time.
  @Column({ type: 'boolean' })
  isCorrect!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
