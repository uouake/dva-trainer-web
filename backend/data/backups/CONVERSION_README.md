# Conversion Markdown → HTML - Documentation

## Résumé

Conversion réussie des explications pédagogiques (frExplanationPedagogique) de Markdown vers HTML pour les 557 questions DVA-C02.

## Fichiers générés

### 1. Script de conversion
- **Chemin**: `backend/scripts/convert-markdown-to-html.ts`
- **Usage**: `npx ts-node convert-markdown-to-html.ts`
- **Description**: Convertit automatiquement tout le markdown (**gras**, *italique*, listes, sauts de ligne) en HTML

### 2. Générateur SQL
- **Chemin**: `backend/scripts/generate-sql-updates.ts`
- **Usage**: `npx ts-node generate-sql-updates.ts`
- **Description**: Génère les requêtes SQL UPDATE pour synchroniser la base PostgreSQL

### 3. Fichiers de backup (dans `backend/data/backups/`)
- `questions-2026-02-10T03-16-48-271Z.json` - Backup original avant conversion
- `conversion-report-2026-02-10T03-16-48-271Z.json` - Rapport de conversion
- `update-pedagogique-html.sql` - Requêtes SQL pour mise à jour Render
- `migration-markdown-to-html.sql` - Documentation migration SQL
- `test-html-rendering.html` - Page HTML de test du rendu

## Règles de conversion appliquées

| Markdown | HTML |
|----------|------|
| `**text**` | `<strong>text</strong>` |
| `*text*` (italique) | `<em>text</em>` |
| Saut de ligne double | `<p>...</p>` |
| `- item` (liste) | `<ul><li>...</li></ul>` |
| `### Titre` | `<h3>Titre</h3>` |

## Résultats

- ✅ **557 questions** traitées
- ✅ **Backup créé** avant modification
- ✅ **Toutes les balises <strong>** correctement converties
- ✅ **Paragraphes** encapsulés dans `<p>`
- ✅ **SQL généré** pour mise à jour Render

## Comment mettre à jour la base Render

### Option 1: SQL Direct (recommandé)

```bash
# Se connecter à la base Render
psql $DATABASE_URL -f backend/data/backups/update-pedagogique-html.sql
```

### Option 2: Via Dashboard Render

1. Allez dans le dashboard Render → PostgreSQL
2. Ouvrez l'outil SQL
3. Copiez-collez le contenu de `update-pedagogique-html.sql`
4. Exécutez

### Option 3: Réimport complète

Si vous préférez, vous pouvez aussi réimporter tout le fichier JSON:

```bash
# Sur le serveur Render (shell)
cd /path/to/project/backend
npm run import:questions  # ou équivalent
```

## Vérification

Pour vérifier que la conversion a fonctionné:

```sql
-- Compter les questions avec HTML
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN fr_explanation_pedagogique LIKE '%<strong>%' THEN 1 END) as avec_gras,
    COUNT(CASE WHEN fr_explanation_pedagogique LIKE '%<p>%' THEN 1 END) as avec_paragraphes
FROM questions
WHERE fr_explanation_pedagogique IS NOT NULL;
```

## Rollback

En cas de problème, utilisez le backup:

```bash
# Restaurer le fichier JSON
cp backend/data/backups/questions-2026-02-10T03-16-48-271Z.json backend/data/questions.json

# Ou restaurer la base SQL depuis un dump préalable
pg_restore --clean --no-owner -d $DATABASE_URL backup-avant-migration.dump
```

## Tester le rendu frontend

Ouvrez le fichier `backend/data/backups/test-html-rendering.html` dans un navigateur pour voir le rendu visuel.

## Notes importantes

1. Les caractères spéciaux HTML (`<`, `>`, `&`) sont échappés correctement
2. Les apostrophes dans le texte français sont préservées
3. Les emojis sont conservés tels quels
4. La structure des paragraphes est maintenue

## Date de conversion

10 février 2026 - 03:16 UTC
