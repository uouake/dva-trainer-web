/**
 * Script de conversion markdown → HTML pour les explications pédagogiques
 * Usage: npx ts-node convert-markdown-to-html.ts
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
 * Convertit le markdown en HTML
 * Gère: gras (**), italique (*), listes (-), sauts de ligne
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Échapper les caractères HTML spéciaux d'abord
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Convertir les titres markdown (### Title) en <h3>
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#\s+(.+)$/gm, '<h2>$1</h2>');
  
  // Convertir le gras **text** → <strong>text></strong>
  // On utilise une regex non-gourmande pour ne pas mélanger les paires
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convertir l'italique *text* → <em>text</em>
  // Mais PAS les étoiles qui sont déjà dans des balises ou qui sont des puces de liste
  // On traite ligne par ligne pour éviter les confusions
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Détecter les listes
    if (line.trim().startsWith('- ')) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      // Extraire le contenu après le tiret
      const content = line.trim().substring(2);
      // Convertir l'italique dans le contenu de la liste
      const processedContent = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      processedLines.push(`<li>${processedContent}</li>`);
    } else if (line.trim() === '' && inList) {
      // Fin de liste
      processedLines.push('</ul>');
      inList = false;
      processedLines.push(line);
    } else {
      if (inList && line.trim() !== '') {
        // On continue dans la liste mais c'est un élément multi-lignes
        // Fermer la liste temporairement
        processedLines.push('</ul>');
        inList = false;
      }
      // Convertir l'italique pour les lignes normales (mais pas si déjà dans une balise)
      if (!line.includes('<li>') && !line.includes('<h')) {
        line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      }
      processedLines.push(line);
    }
  }
  
  // Fermer la liste si nécessaire
  if (inList) {
    processedLines.push('</ul>');
  }
  
  html = processedLines.join('\n');
  
  // Convertir les sauts de ligne doubles en paragraphes
  // On split par double saut de ligne
  const paragraphs = html.split(/\n\n+/);
  const wrappedParagraphs = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    // Ne pas wrapper si c'est déjà une balise block
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul>') || trimmed.startsWith('<li>') || trimmed.endsWith('</ul>')) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  });
  
  html = wrappedParagraphs.join('\n');
  
  // Nettoyer les paragraphes vides
  html = html.replace(/<p><\/p>/g, '');
  
  // Nettoyer les espaces multiples
  html = html.replace(/\n{3,}/g, '\n\n');
  
  return html.trim();
}

function main() {
  const inputFile = path.join(__dirname, '..', 'data', 'questions.json');
  const backupDir = path.join(__dirname, '..', 'data', 'backups');
  const outputFile = path.join(__dirname, '..', 'data', 'questions.json');
  
  console.log('🚀 Démarrage de la conversion markdown → HTML');
  console.log(`📁 Fichier source: ${inputFile}`);
  
  // Vérifier que le fichier existe
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Erreur: Le fichier ${inputFile} n'existe pas`);
    process.exit(1);
  }
  
  // Créer le dossier de backup si nécessaire
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Backup du fichier original
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `questions-${timestamp}.json`);
  
  console.log('💾 Création du backup...');
  fs.copyFileSync(inputFile, backupFile);
  console.log(`✅ Backup créé: ${backupFile}`);
  
  // Lire le fichier JSON
  console.log('📖 Lecture du fichier JSON...');
  const fileContent = fs.readFileSync(inputFile, 'utf-8');
  const data: QuestionsFile = JSON.parse(fileContent);
  
  console.log(`📊 Nombre de questions: ${data.questions.length}`);
  
  // Compter les questions avec frExplanationPedagogique
  const questionsWithPedago = data.questions.filter(q => q.frExplanationPedagogique && q.frExplanationPedagogique.trim() !== '');
  console.log(`📝 Questions avec explication pédagogique: ${questionsWithPedago.length}`);
  
  // Convertir les explications
  let convertedCount = 0;
  let skippedCount = 0;
  
  for (const question of data.questions) {
    if (question.frExplanationPedagogique && question.frExplanationPedagogique.trim() !== '') {
      const original = question.frExplanationPedagogique;
      
      // Vérifier si c'est déjà du HTML (contient des balises HTML)
      if (original.includes('<strong>') || original.includes('<p>') || original.includes('<ul>')) {
        skippedCount++;
        continue;
      }
      
      const converted = markdownToHtml(original);
      question.frExplanationPedagogique = converted;
      convertedCount++;
      
      // Log pour debugging (première question seulement)
      if (convertedCount === 1) {
        console.log('\n📝 Exemple de conversion (première question):');
        console.log('--- AVANT ---');
        console.log(original.substring(0, 500) + '...');
        console.log('\n--- APRÈS ---');
        console.log(converted.substring(0, 500) + '...');
      }
    }
  }
  
  console.log(`\n📊 Statistiques de conversion:`);
  console.log(`   - Converties: ${convertedCount}`);
  console.log(`   - Déjà en HTML (ignorées): ${skippedCount}`);
  console.log(`   - Total traité: ${convertedCount + skippedCount}`);
  
  // Sauvegarder le fichier modifié
  console.log('\n💾 Sauvegarde du fichier modifié...');
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Fichier sauvegardé: ${outputFile}`);
  
  // Générer un rapport de conversion
  const report = {
    timestamp: new Date().toISOString(),
    totalQuestions: data.questions.length,
    converted: convertedCount,
    skipped: skippedCount,
    backupFile: backupFile
  };
  
  const reportFile = path.join(backupDir, `conversion-report-${timestamp}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`📝 Rapport de conversion: ${reportFile}`);
  
  console.log('\n✨ Conversion terminée avec succès!');
}

main();
