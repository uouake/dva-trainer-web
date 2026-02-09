# 🚀 Déploiement DVA Trainer Web

Ce guide explique comment déployer l'application DVA Trainer Web sur Render (gratuit).

## Architecture de déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                         RENDER                              │
│  ┌─────────────────────┐      ┌─────────────────────────┐   │
│  │   dva-trainer-web   │      │    dva-trainer-api      │   │
│  │   (Angular Static)  │─────▶│    (NestJS + Node)      │   │
│  │   URL: *.onrender.com     │      │    Port: 10000          │   │
│  └─────────────────────┘      └───────────┬─────────────┘   │
│                                           │                 │
│                              ┌────────────▼─────────────┐   │
│                              │   dva-trainer-db         │   │
│                              │   (PostgreSQL)           │   │
│                              └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Coût

- **Gratuit** : Tous les services utilisent le plan "Free"
- Limitations du plan gratuit :
  - Le backend "sleep" après 15 min d'inactivité (démarrage ~30s)
  - La BDD PostgreSQL expire après 90 jours (recréable)
  - Bande passante limitée mais suffisante pour usage perso

## Prérequis

1. Compte GitHub avec le repo `dva-trainer-web`
2. Compte Render (gratuit) : https://render.com
3. Fichier de questions JSON (pour le seeding)

## Étapes de déploiement

### 1. Préparer le repo

Les fichiers suivants ont été ajoutés/modifiés :

```
├── render.yaml              # Configuration Render (Blueprint)
├── backend/start-prod.sh    # Script de démarrage production
└── frontend/
    ├── set-env.js           # Génération de l'env au build
    ├── package.json         # Script build:prod ajouté
    └── src/environments/
        └── environment.production.ts  # Config prod
```

### 2. Commit et push

```bash
git add render.yaml backend/start-prod.sh frontend/set-env.js \
    frontend/package.json frontend/src/environments/environment.production.ts
git commit -m "Add Render deployment configuration"
git push
```

### 3. Créer le Blueprint sur Render

1. Allez sur https://dashboard.render.com/blueprints
2. Cliquez **"New Blueprint Instance"**
3. Connectez votre repo GitHub `dva-trainer-web`
4. Render va détecter automatiquement le `render.yaml` et créer :
   - La base de données PostgreSQL
   - Le service backend (NestJS)
   - Le service frontend (Angular static)

### 4. Seeder la base de données (une fois)

Après le premier déploiement, vous devez importer vos questions :

**Option A - via Render Shell :**
1. Allez sur le service `dva-trainer-api` dans le dashboard Render
2. Cliquez sur **"Shell"** tab
3. Exécutez :
```bash
# Uploadez d'abord votre fichier JSON via "Files" tab ou :
curl -o /tmp/questions.json "URL_DE_VOTRE_FICHIER"
export QUESTIONS_JSON_PATH=/tmp/questions.json
npm run db:seed
```

**Option B - en local puis export/import :**
1. Seedez en local d'abord
2. Exportez la BDD et importez sur Render

### 5. URLs d'accès

Une fois déployé :
- **Frontend** : `https://dva-trainer-web.onrender.com`
- **Backend API** : `https://dva-trainer-api.onrender.com`
- **Health Check** : `https://dva-trainer-api.onrender.com/api/health`

## Configuration des variables d'environnement

Les variables sont automatiquement configurées via `render.yaml`, mais vous pouvez les modifier dans le dashboard :

**Backend (`dva-trainer-api`) :**
- `NODE_ENV=production`
- `PORT=10000`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (auto depuis la BDD)

**Frontend (`dva-trainer-web`) :**
- `NODE_ENV=production`
- `API_BASE_URL` (configuré dans le build command)

## Commandes utiles

### Redéploiement manuel
```bash
# Sur Render dashboard
# Services → [Service] → Manual Deploy → Deploy Latest Commit
```

### Logs
```bash
# Via Render dashboard : Services → [Service] → Logs
```

### Seeder manuellement
```bash
# Backend shell sur Render
cd backend
export QUESTIONS_JSON_PATH=/path/to/dva-c02.questions.fr.json
npm run db:seed
```

## Dépannage

### Le backend ne démarre pas
- Vérifier les logs Render
- Vérifier que la BDD est bien créée et accessible
- Vérifier `DB_HOST` et autres variables

### Erreur CORS
- Le CORS est configuré en mode permissif (`origin: true`)
- Si problème persiste, vérifier l'URL du frontend dans `render.yaml`

### Questions non affichées
- Vérifier que le seed a bien été fait : `SELECT COUNT(*) FROM questions;`
- Relancer le seed si nécessaire

## Migration vers un plan payant (optionnel)

Si vous voulez éviter le "sleep" après 15 min :
1. Passer le backend en plan **Starter** ($7/mois)
2. La BDD free reste utilisable ou passer en **Starter** ($15/mois)

## Résumé des fichiers créés

| Fichier | Description |
|---------|-------------|
| `render.yaml` | Blueprint Render - définit tous les services |
| `backend/start-prod.sh` | Script de démarrage avec schema + seed |
| `frontend/set-env.js` | Génère l'environnement Angular au build |
| `frontend/src/environments/environment.production.ts` | Config API prod |
