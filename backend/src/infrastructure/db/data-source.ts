import 'dotenv/config';
import { DataSource } from 'typeorm';
import { makeTypeOrmOptions } from './typeorm.config';

// TypeORM DataSource.
//
// This file is used by the TypeORM CLI (migration generation / running).
// We keep it under infrastructure/db because it's purely infrastructure.

export const AppDataSource = new DataSource(makeTypeOrmOptions());
