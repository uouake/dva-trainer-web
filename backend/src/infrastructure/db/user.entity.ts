import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

// UserEntity
//
// Stores authenticated users from GitHub OAuth.
// 
// Migration notes:
// - This is the first version of user authentication.
// - Anonymous attempts (from before auth) are kept as-is.
// - See migration 001-add-users-table.ts for details.

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // GitHub OAuth unique identifier
  @Index({ unique: true })
  @Column({ name: 'github_id', type: 'text' })
  githubId!: string;

  @Column({ name: 'email', type: 'text', nullable: true })
  email?: string;

  // GitHub username (login)
  @Column({ name: 'username', type: 'text', nullable: true })
  username?: string;

  // Display name
  @Column({ name: 'name', type: 'text', nullable: true })
  name?: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
