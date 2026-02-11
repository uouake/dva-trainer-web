import { DataSourceOptions } from 'typeorm';
import { requireEnv, envInt, env } from '../../config/env';
import { QuestionEntity, UserEntity, AttemptEntity, ChapterEntity, UserChapterProgressEntity } from './typeorm.entities';

// Parse DATABASE_URL if provided (Render style), otherwise use individual vars
function parseDatabaseUrl(): { host: string; port: number; username: string; password: string; database: string } | null {
  const url = env('DATABASE_URL');
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      username: parsed.username,
      password: parsed.password,
      database: parsed.pathname.slice(1), // Remove leading /
    };
  } catch {
    return null;
  }
}

// TypeORM configuration.
//
// Note: In an hexagonal-ish architecture, TypeORM belongs to the *infrastructure* layer.
// The rest of the application should talk to repositories (interfaces), not to TypeORM.

export function makeTypeOrmOptions(): DataSourceOptions {
  const dbUrl = parseDatabaseUrl();
  const isTest = process.env.NODE_ENV === 'test';
  
  return {
    type: 'postgres',
    host: dbUrl?.host ?? (isTest ? 'localhost' : requireEnv('DB_HOST')),
    port: dbUrl?.port ?? envInt('DB_PORT', 5432),
    username: dbUrl?.username ?? (isTest ? 'test' : requireEnv('DB_USER')),
    password: dbUrl?.password ?? (isTest ? 'test' : requireEnv('DB_PASSWORD')),
    database: dbUrl?.database ?? (isTest ? 'dva_test' : requireEnv('DB_NAME')),

    // For MVP we use migrations (recommended) instead of synchronize.
    // - synchronize=true can destroy data when entities change.
    // In test mode, we enable synchronize for easier testing
    synchronize: isTest,

    // Entities are the TypeORM representations of our DB tables.
    // They are NOT the same thing as Domain entities.
    entities: [QuestionEntity, UserEntity, AttemptEntity, ChapterEntity, UserChapterProgressEntity],

    // Migrations are generated as TypeScript during development.
    // When we build (`nest build`), they will be compiled to JS under dist/.
    migrations: [
      'src/infrastructure/db/migrations/*.{ts,js}',
      'dist/infrastructure/db/migrations/*.{ts,js}',
    ],
  };
}
