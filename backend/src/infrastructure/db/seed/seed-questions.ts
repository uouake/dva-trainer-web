import 'dotenv/config';
import { DataSource } from 'typeorm';
import { makeTypeOrmOptions } from '../typeorm.config';
import { QuestionEntity } from '../typeorm.entities';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Seed script: imports the question bank JSON into Postgres.
//
// Input file is generated earlier in the workflow:
//   examtopics-downloader/dva-c02.questions.fr.json
//
// We keep the seed logic explicit and well-commented so it's easy to understand.

type QuestionJson = {
  id: string;
  exam: string;
  topic: number;
  questionNumber: number;
  stem: string;
  choices: Record<string, string>;
  answer: string;
  conceptKey: string;
  domainKey?: string;
  frExplanation: string;
  frExplanationPedagogique?: string;
  sourceUrl: string;
  textHash: string;
  isActive?: boolean;
};

async function main() {
  // Where to read the question bank from.
  // We support multiple locations because the repo may live outside the OpenClaw workspace.
  const candidates = [
    process.env.QUESTIONS_JSON_PATH,
    // sibling of repo root: /Users/uouake/workspace/examtopics-downloader/...
    resolve(process.cwd(), '..', 'examtopics-downloader', 'dva-c02.questions.fr.json'),
    // legacy OpenClaw workspace location
    resolve(process.cwd(), '..', '.openclaw', 'workspace', 'examtopics-downloader', 'dva-c02.questions.fr.json'),
    // relative to this file (original layout)
    resolve(__dirname, '../../../../../..', 'examtopics-downloader', 'dva-c02.questions.fr.json'),
  ].filter(Boolean) as string[];

  const filePath = candidates.find((p) => {
    try {
      return !!p && require('node:fs').existsSync(p);
    } catch {
      return false;
    }
  });

  if (!filePath) {
    throw new Error(
      `Question bank JSON not found. Set QUESTIONS_JSON_PATH or place file at: ${candidates.join(', ')}`,
    );
  }

  const raw = readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw);

  const questions: QuestionJson[] = parsed.questions;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('No questions found in JSON file.');
  }

  const ds = new DataSource({
    ...makeTypeOrmOptions(),
    // We assume schema already exists (created via create-schema script).
    synchronize: false,
    logging: false,
  });

  await ds.initialize();
  const repo = ds.getRepository(QuestionEntity);

  console.log(`Seeding ${questions.length} questions...`);

  // Insert in chunks to avoid huge single queries.
  const chunkSize = 200;
  for (let i = 0; i < questions.length; i += chunkSize) {
    const chunk = questions.slice(i, i + chunkSize);

    // TypeORM will generate INSERT statements.
    // We use upsert-like behavior by catching duplicates later; for MVP we can just clear table first.
    const entities = chunk.map((q) => {
      const e = new QuestionEntity();
      e.id = q.id;
      e.exam = q.exam;
      e.topic = q.topic;
      e.questionNumber = q.questionNumber;
      e.stem = q.stem;
      e.choices = q.choices;
      e.answer = q.answer;
      e.conceptKey = q.conceptKey;
      e.domainKey = q.domainKey ?? 'unknown';
      e.frExplanation = q.frExplanation;
      e.frExplanationPedagogique = q.frExplanationPedagogique;
      e.sourceUrl = q.sourceUrl;
      e.textHash = q.textHash;
      e.isActive = q.isActive ?? true;
      return e;
    });

    // For idempotency: delete existing ids in this chunk first.
    // This keeps the script re-runnable.
    const ids = entities.map((e) => e.id);
    await repo.delete(ids);
    await repo.save(entities);

    console.log(`Seeded ${Math.min(i + chunkSize, questions.length)}/${questions.length}`);
  }

  console.log('Seed done.');
  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
