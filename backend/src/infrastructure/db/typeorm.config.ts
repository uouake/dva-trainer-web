import { DataSourceOptions } from 'typeorm';
import { requireEnv, envInt } from '../../config/env';
import { QuestionEntity } from './typeorm.entities';
import { AttemptEntity } from './attempt.entity';

// TypeORM configuration.
//
// Note: In an hexagonal-ish architecture, TypeORM belongs to the *infrastructure* layer.
// The rest of the application should talk to repositories (interfaces), not to TypeORM.

export function makeTypeOrmOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: requireEnv('DB_HOST'),
    port: envInt('DB_PORT', 5432),
    username: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),

    // For MVP we use migrations (recommended) instead of synchronize.
    // - synchronize=true can destroy data when entities change.
    synchronize: false,

    // Entities are the TypeORM representations of our DB tables.
    // They are NOT the same thing as Domain entities.
    entities: [QuestionEntity, AttemptEntity],

    // Migrations are generated as TypeScript during development.
    // When we build (`nest build`), they will be compiled to JS under dist/.
    migrations: [
      'src/infrastructure/db/migrations/*.{ts,js}',
      'dist/infrastructure/db/migrations/*.{ts,js}',
    ],
  };
}
