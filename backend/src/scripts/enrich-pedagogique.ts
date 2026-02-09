import 'dotenv/config';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Script pour regénérer les explications FR avec un ton "adolescent-friendly"
// avec des analogies concrètes et des situations imagées du quotidien.
// L'objectif : un ado sans connaissance AWS peut comprendre et répondre correctement.

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
  frExplanationPedagogique?: string;
  sourceUrl: string;
  textHash: string;
  isActive?: boolean;
};

type Bank = { questions: Question[] };

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
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'Tu es un professeur passionné qui explique AWS à des adolescents de 15-16 ans. Tu utilises des analogies avec leur quotidien (école, sport, réseaux sociaux, jeux vidéo). Jamais de jargon technique sans explication.',
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

  return `Explique cette question AWS à un adolescent de 15 ans qui n'y connaît RIEN en informatique cloud.

RÈGLES IMPORTANTES :
1. Utilise une analogie concrète du quotidien (école, cantine, bibliothèque, livraison de pizzas, jeu vidéo...)
2. Explique d'abord le CONCEPT général avec l'analogie
3. Explique ensuite pourquoi la bonne réponse est la bonne (toujours avec l'analogie)
4. Ne mentionne pas de services AWS complexes sans les expliquer comme si c'était la première fois
5. L'ado doit pouvoir répondre correctement JUSTE avec ton explication
6. Maximum 8-10 lignes, phrases courtes

Question AWS :
"${q.stem}"

Choix possibles :
${choices}

Bonne réponse : ${q.answer}

Réponds en JSON avec cette structure :
{
  "analogie": "[Le contexte de l'analogie choisie, ex: 'Imagine que tu organises une fête...']",
  "explication": "[L'explication complète avec l'analogie, qui permet de comprendre pourquoi ${q.answer} est la bonne réponse]"
}`;
}

async function main() {
  const inputPath = process.env.INPUT ?? resolve(process.cwd(), '..', 'examtopics-downloader', 'dva-c02.questions.fr.enriched.json');
  const outputPath = process.env.OUTPUT ?? resolve(process.cwd(), '..', 'examtopics-downloader', 'dva-c02.questions.fr.pedagogique.json');

  if (!existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const raw = readFileSync(inputPath, 'utf-8');
  const parsed = JSON.parse(raw) as Bank;
  if (!Array.isArray(parsed.questions)) throw new Error('Invalid bank JSON');

  let out: Bank = parsed;
  if (existsSync(outputPath)) {
    try {
      out = JSON.parse(readFileSync(outputPath, 'utf-8')) as Bank;
    } catch {
      // ignore
    }
  }

  let done = 0;
  for (let i = 0; i < out.questions.length; i++) {
    const q = out.questions[i]!;

    // Skip if already has pedagogical explanation
    if (q.frExplanationPedagogique && q.frExplanationPedagogique.length > 100) {
      done++;
      console.log(`[${done}/${out.questions.length}] skipped (already has): ${q.id}`);
      continue;
    }

    const prompt = buildPrompt(q);

    try {
      const r = await openaiJson<{ analogie: string; explication: string }>(prompt);
      
      q.frExplanationPedagogique = `**${r.analogie}**

${r.explication}`;

      // Save progress
      writeFileSync(outputPath, JSON.stringify(out, null, 2));

      done++;
      console.log(`[${done}/${out.questions.length}] enriched: ${q.id}`);
    } catch (err) {
      console.error(`[ERROR] ${q.id}:`, err);
      // Continue with next question
    }

    // Gentle pacing
    await new Promise((r) => setTimeout(r, Number(process.env.SLEEP_MS ?? 200)));
  }

  console.log(`Done. Output: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
