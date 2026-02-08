import 'dotenv/config';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Enriches the question bank JSON with:
// - domainKey (one of: development|security|deployment|troubleshooting)
// - frExplanation (beginner-friendly, not a literal translation)
//
// This script uses OpenAI via OPENAI_API_KEY.
// It is designed to be restartable (writes progress to outputPath).

type Question = {
  id: string;
  exam: string;
  topic: number;
  questionNumber: number;
  stem: string;
  choices: Record<string, string>;
  answer: string;
  conceptKey: string;
  domainKey?: string;
  frExplanation?: string;
  sourceUrl: string;
  textHash: string;
  isActive?: boolean;
};

type Bank = { questions: Question[] };

type DomainKey = 'development' | 'security' | 'deployment' | 'troubleshooting';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function openaiJson<T>(prompt: string): Promise<T> {
  const apiKey = requireEnv('OPENAI_API_KEY');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-5.2',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert AWS educator. Output ONLY valid JSON. No markdown. No extra keys.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as any;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI: empty response');
  return JSON.parse(content) as T;
}

function buildPrompt(q: Question) {
  const choices = Object.entries(q.choices)
    .map(([k, v]) => `${k}. ${v}`)
    .join('\n');

  return `For the AWS Certified Developer Associate (DVA-C02) question below, produce JSON with keys:\n\n- domainKey: one of [development, security, deployment, troubleshooting]\n- frExplanation: French explanation for a complete beginner (no AWS assumed). Must be clear, practical, and help someone answer the question using common sense. Use simple terms, define AWS services briefly, and explain why the correct answer is correct. Keep it concise (6-12 lines).\n\nQuestion:\n${q.stem}\n\nChoices:\n${choices}\n\nCorrect answer: ${q.answer}`;
}

async function main() {
  const inputPath = process.env.INPUT ?? resolve(process.cwd(), '..', 'examtopics-downloader', 'dva-c02.questions.fr.json');
  const outputPath = process.env.OUTPUT ?? resolve(process.cwd(), '..', 'examtopics-downloader', 'dva-c02.questions.fr.enriched.json');

  if (!existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath} (set INPUT=...)`);
  }

  const raw = readFileSync(inputPath, 'utf-8');
  const parsed = JSON.parse(raw) as Bank;
  if (!Array.isArray(parsed.questions)) throw new Error('Invalid bank JSON: missing questions array');

  // Resume support: if output exists, load it and continue.
  let out: Bank = parsed;
  if (existsSync(outputPath)) {
    try {
      out = JSON.parse(readFileSync(outputPath, 'utf-8')) as Bank;
    } catch {
      // ignore
    }
  }

  const domainKeys: DomainKey[] = ['development', 'security', 'deployment', 'troubleshooting'];

  let done = 0;
  for (let i = 0; i < out.questions.length; i++) {
    const q = out.questions[i]!;

    const needsDomain = !q.domainKey || q.domainKey === 'unknown';
    const needsExplanation = !q.frExplanation || q.frExplanation.trim().length < 40;
    if (!needsDomain && !needsExplanation) {
      done++;
      continue;
    }

    const prompt = buildPrompt(q);

    const r = await openaiJson<{ domainKey: DomainKey; frExplanation: string }>(prompt);

    if (!domainKeys.includes(r.domainKey)) {
      throw new Error(`Invalid domainKey from model for ${q.id}: ${r.domainKey}`);
    }

    q.domainKey = r.domainKey;
    q.frExplanation = r.frExplanation.trim();

    // Save progress every question (safe, restartable).
    writeFileSync(outputPath, JSON.stringify(out, null, 2));

    done++;
    // eslint-disable-next-line no-console
    console.log(`[${done}/${out.questions.length}] enriched: ${q.id}`);

    // Gentle pacing.
    await new Promise((r) => setTimeout(r, Number(process.env.SLEEP_MS ?? 150)));
  }

  // eslint-disable-next-line no-console
  console.log(`Done. Output: ${outputPath}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
