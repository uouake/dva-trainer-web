/**
 * Script pour générer les requêtes SQL UPDATE à partir du JSON converti
 * Usage: npx ts-node generate-sql-updates.ts
 * 
 * Ce script génère un fichier SQL avec toutes les commandes UPDATE nécessaires
 * pour synchroniser la base de données PostgreSQL avec le JSON converti.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Question {
  id: string;
  exam: string;
  topic: number;
  questionNumber: number;
  stem: string;
  choices: Record<string, string>;
  answer: string;
  suggestedAnswer: string;
  sourceUrl: string;
  timestampRaw: string;
  textHash: string;
  rawFormat: string;
  conceptKey: string;
  frExplanation?: string;
  domainKey: string;
  frExplanationPedagogique?: string;
  requiredAnswers: number;
}

interface QuestionsFile {
  meta: {
    generatedAt: string;
    sourceMarkdown: string;
    count: number;
    skippedBlocks: number;
    missingAnswer: number;
    missingChoices: number;
    missingSourceUrl: number;
    frExplanations: {
      count: number;
      conceptKeys: number;
      newKeysCreated: number;
    };
  };
  questions: Question[];
}

/**
 * Échappe les caractères spéciaux SQL
 */
function escapeSql(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

function main() {
  const inputFile = path.join(__dirname, '..', 'data', 'questions.json');
  const outputFile = path.join(__dirname, '..', 'data', 'backups', 'update-pedagogique-html.sql');
  
  console.log('🚀 Génération des requêtes SQL UPDATE');
  console.log(`📁 Fichier source: ${inputFile}`);
  
  // Lire le fichier JSON
  const fileContent = fs.readFileSync(inputFile, 'utf-8');
  const data: QuestionsFile = JSON.parse(fileContent);
  
  console.log(`📊 Nombre de questions: ${data.questions.length}`);
  
  // Générer les requêtes SQL
  const updates: string[] = [];
  updates.push('-- SQL Update statements for frExplanationPedagogique HTML conversion');
  updates.push('-- Generated: ' + new Date().toISOString());
  updates.push('-- Total questions: ' + data.questions.length);
  updates.push('');
  updates.push('BEGIN;');
  updates.push('');
  updates.push('-- Disable triggers if necessary (optional)');
  updates.push('-- ALTER TABLE questions DISABLE TRIGGER ALL;');
  updates.push('');
  
  let updateCount = 0;
  
  for (const question of data.questions) {
    if (question.frExplanationPedagogique && question.frExplanationPedagogique.trim() !== '') {
      const escapedHtml = escapeSql(question.frExplanationPedagogique);
      
      const sql = `UPDATE questions 
SET fr_explanation_pedagogique = E'${escapedHtml}'
WHERE id = '${question.id}';`;
      
      updates.push(sql);
      updates.push('');
      updateCount++;
    }
  }
  
  updates.push('-- Re-enable triggers if disabled');
  updates.push('-- ALTER TABLE questions ENABLE TRIGGER ALL;');
  updates.push('');
  updates.push('COMMIT;');
  updates.push('');
  updates.push(`-- Total updates generated: ${updateCount}`);
  
  // Écrire le fichier SQL
  fs.writeFileSync(outputFile, updates.join('\n'), 'utf-8');
  
  console.log(`✅ Fichier SQL généré: ${outputFile}`);
  console.log(`📊 Nombre de requêtes UPDATE: ${updateCount}`);
  console.log('');
  console.log('💡 Pour exécuter cette migration sur Render:');
  console.log('   1. Connectez-vous à votre base de données Render');
  console.log('   2. Exécutez: psql $DATABASE_URL -f update-pedagogique-html.sql');
  console.log('   3. Ou utilisez le dashboard SQL de Render');
  console.log('');
  console.log('⚠️  ATTENTION: Assurez-vous d\'avoir un backup de votre base de données avant d\'exécuter!');
}

main();
