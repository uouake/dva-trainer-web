-- Migration SQL pour mettre à jour les explications pédagogiques avec du HTML
-- Généré le: 2026-02-10
-- Source: conversion Markdown → HTML

-- Cette migration met à jour la colonne fr_explanation_pedagogique pour toutes les questions
-- en remplaçant le markdown par du HTML formaté.

-- NOTE: Cette migration suppose que vous avez déjà importé les données JSON converties.
-- Si vous utilisez directement cette migration SQL, vous devez avoir les valeurs HTML prêtes.

-- Méthode 1: Mise à jour depuis un fichier JSON (recommandé)
-- Vous pouvez utiliser le script Node.js 'sync-to-database.ts' pour synchroniser automatiquement

-- Méthode 2: Mise à jour manuelle par question (si nécessaire pour quelques questions spécifiques)
-- Exemple:
-- UPDATE questions 
-- SET fr_explanation_pedagogique = '<p><strong>🏰 Imagine ton immeuble résidentiel</strong>...</p>'
-- WHERE id = 'dva-c02:topic:1:question:57:3a6b6e5b2b90ee0d';

-- ============================================================
-- VÉRIFICATION POST-MIGRATION
-- ============================================================

-- Vérifier que les questions ont bien été mises à jour
-- La requête suivante compte les questions qui contiennent des balises HTML
SELECT 
    COUNT(*) as total_questions,
    COUNT(CASE WHEN fr_explanation_pedagogique LIKE '%<strong>%' THEN 1 END) as with_html_strong,
    COUNT(CASE WHEN fr_explanation_pedagogique LIKE '%<p>%' THEN 1 END) as with_html_paragraphs
FROM questions
WHERE fr_explanation_pedagogique IS NOT NULL 
  AND fr_explanation_pedagogique != '';

-- Vérifier les questions qui pourraient encore contenir du markdown non converti
-- (recherche de patterns ** ou * non suivis de balises HTML)
SELECT 
    id,
    LEFT(fr_explanation_pedagogique, 100) as preview
FROM questions
WHERE fr_explanation_pedagogique LIKE '%**%'
   OR (fr_explanation_pedagogique LIKE '%*%' 
       AND fr_explanation_pedagogique NOT LIKE '%<strong>%'
       AND fr_explanation_pedagogique NOT LIKE '%<em>%');

-- ============================================================
-- ROLLBACK (si nécessaire)
-- ============================================================

-- Si vous avez besoin de restaurer les anciennes valeurs markdown,
-- utilisez le backup créé avant la conversion:
-- /backend/data/backups/questions-2026-02-10T03-16-48-271Z.json

-- Exemple de rollback pour une question spécifique:
-- UPDATE questions 
-- SET fr_explanation_pedagogique = '**🏰 Imagine ton immeuble résidentiel** : plusieurs appartements...'
-- WHERE id = 'dva-c02:topic:1:question:57:3a6b6e5b2b90ee0d';
