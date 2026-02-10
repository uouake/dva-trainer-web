# Migration 001: Add Users Table and Auth Support

## Résumé

Cette migration ajoute le support de l'authentification GitHub OAuth tout en maintenant la rétrocompatibilité avec les tentatives anonymes existantes.

## Changements

### 1. Nouvelle table `users`

Stocke les utilisateurs authentifiés via GitHub OAuth:

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique interne |
| `github_id` | TEXT | Identifiant GitHub (unique) |
| `email` | TEXT | Email de l'utilisateur (nullable) |
| `username` | TEXT | Nom d'utilisateur GitHub (nullable) |
| `name` | TEXT | Nom d'affichage (nullable) |
| `avatar_url` | TEXT | URL de l'avatar (nullable) |
| `created_at` | TIMESTAMP | Date de création |

### 2. Modifications table `attempts`

Nouvelles colonnes ajoutées:

| Colonne | Type | Description |
|---------|------|-------------|
| `auth_type` | VARCHAR(20) | Type d'authentification (`anonymous` ou `github`) |
| `github_user_id` | TEXT | Référence vers `users.github_id` (nullable) |

## Rétrocompatibilité

✅ **Aucune donnée existante n'est perdue**

- `auth_type` a une valeur par défaut `'anonymous'` pour toutes les tentatives existantes
- `github_user_id` est nullable, donc les anciennes tentatives restent valides
- Les URLs avec UUID anonymes continuent de fonctionner

## Exécution de la migration

### Option 1: Via TypeORM CLI (recommandé)

```bash
cd backend
npx typeorm migration:run -d src/infrastructure/db/data-source.ts
```

### Option 2: Via SQL direct

```bash
psql $DATABASE_URL -f backend/src/infrastructure/db/migrations/001-add-users-table.sql
```

### Option 3: Via npm script

Ajoutez dans `package.json`:
```json
"scripts": {
  "migration:run": "typeorm migration:run -d src/infrastructure/db/data-source.ts",
  "migration:revert": "typeorm migration:revert -d src/infrastructure/db/data-source.ts"
}
```

Puis:
```bash
npm run migration:run
```

## Rollback

```bash
npx typeorm migration:revert -d src/infrastructure/db/data-source.ts
```

## Vérification

Après migration, vérifiez avec:

```sql
-- Vérifier la structure de la table users
\d users

-- Vérifier les nouvelles colonnes dans attempts
\d attempts

-- Compter les tentatives par type d'authentification
SELECT auth_type, COUNT(*) FROM attempts GROUP BY auth_type;
```

## Points d'attention

1. **Anciennes URLs**: Les URLs avec UUID anonymes fonctionnent toujours sans modification
2. **Données anonymes**: Les tentatives anonymes restent anonymes, aucune migration de données nécessaire
3. **Sécurité**: Aucune fuite de données entre utilisateurs, chaque utilisateur ne voit que ses propres tentatives

## Entités TypeORM

- `UserEntity`: `/backend/src/infrastructure/db/user.entity.ts`
- `AttemptEntity`: `/backend/src/infrastructure/db/attempt.entity.ts` (modifié)

## Migration

- TypeScript: `/backend/src/infrastructure/db/migrations/001-add-users-table.ts`
- SQL: `/backend/src/infrastructure/db/migrations/001-add-users-table.sql`
