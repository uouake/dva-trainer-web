import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

// Database entity for a question.
//
// We store the question bank exactly once in the DB.
// Later, user attempts / schedules / exams will reference these question ids.

@Entity({ name: 'questions' })
export class QuestionEntity {
  // Stable id: e.g. "dva-c02:topic:1:question:57:3a6b6e5b2b90ee0d"
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Index()
  @Column({ type: 'text' })
  exam!: string;

  @Column({ type: 'int' })
  topic!: number;

  @Column({ type: 'int' })
  questionNumber!: number;

  @Column({ type: 'text' })
  stem!: string;

  // We keep choices as JSON for flexibility (A/B/C/D, multi-line, etc.)
  @Column({ type: 'jsonb' })
  choices!: Record<string, string>;

  // For now a single letter ("A".."D").
  // We can evolve later to support multiple answers.
  @Column({ type: 'text' })
  answer!: string;

  @Index()
  @Column({ type: 'text' })
  conceptKey!: string;

  // Domain key for DVA-C02 blueprint (e.g. "development", "security", ...)
  // Added for V1 domain breakdown.
  @Index()
  @Column({ type: 'text', default: 'unknown' })
  domainKey!: string;

  @Column({ type: 'text' })
  frExplanation!: string;

  @Column({ type: 'text' })
  sourceUrl!: string;

  @Column({ type: 'text' })
  textHash!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
