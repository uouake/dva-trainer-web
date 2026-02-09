import 'dotenv/config';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Script pour taguer les questions qui nécessitent 2 réponses (Choose two)

type Question = {
  id: string;
  stem: string;
  requiredAnswers?: number;
  [key: string]: any;
};

type Bank = { questions: Question[] };

function detectRequiredAnswers(stem: string): number {
  const lowerStem = stem.toLowerCase();
  
  // Patterns pour détecter les questions à 2 réponses
  const twoAnswerPatterns = [
    /choose two/i,
    /select two/i,
    /pick two/i,
    /which two/i,
    /\(choose two\)/i,
    /\(select two\)/i,
    /choisir deux/i,
    /sélectionner deux/i,
    /deux réponses/i,
  ];
  
  for (const pattern of twoAnswerPatterns) {
    if (pattern.test(lowerStem) || pattern.test(stem)) {
      return 2;
    }
  }
  
  return 1; // Par défaut, une seule réponse
}

async function main() {
  const inputPath = process.env.INPUT ?? resolve(process.cwd(), '..', 'examtopics-downloader', 'dva-c02.questions.fr.improved.json');
  const outputPath = process.env.OUTPUT ?? resolve(process.cwd(), '..', 'examtopics-downloader', 'dva-c02.questions.fr.tagged.json');

  if (!existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const raw = readFileSync(inputPath, 'utf-8');
  const parsed = JSON.parse(raw) as Bank;
  
  let taggedCount = 0;
  
  for (const q of parsed.questions) {
    const required = detectRequiredAnswers(q.stem);
    if (required !== q.requiredAnswers) {
      q.requiredAnswers = required;
      if (required > 1) {
        taggedCount++;
        console.log(`[TAGGED] ${q.id} - ${required} answers required`);
      }
    }
  }
  
  writeFileSync(outputPath, JSON.stringify(parsed, null, 2));
  
  console.log(`\n✅ Done! Tagged ${taggedCount} questions with requiredAnswers > 1.`);
  console.log(`Output: ${outputPath}`);
  
  // Statistiques
  const totalQuestions = parsed.questions.length;
  const singleAnswer = parsed.questions.filter(q => (q.requiredAnswers || 1) === 1).length;
  const multiAnswer = parsed.questions.filter(q => (q.requiredAnswers || 1) > 1).length;
  
  console.log(`\n📊 Statistics:`);
  console.log(`  Total questions: ${totalQuestions}`);
  console.log(`  Single answer: ${singleAnswer} (${Math.round((singleAnswer/totalQuestions)*100)}%)`);
  console.log(`  Multiple answers: ${multiAnswer} (${Math.round((multiAnswer/totalQuestions)*100)}%)`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
