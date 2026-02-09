# 🚀 DÉPLOIEMENT RENDER - INSTRUCTIONS FINALES

## ✅ État actuel

Les fichiers de configuration ont été créés et pushés sur GitHub :
- **Commit** : `6b4a6d1`
- **Branch** : `main`
- **Repo** : `https://github.com/uouake/dva-trainer-web`

## 📋 Étapes à suivre sur Render

### 1. Connexion à Render

1. Allez sur https://dashboard.render.com/
2. Connectez-vous (ou créez un compte gratuit)
3. Liez votre compte GitHub à Render

### 2. Créer le Blueprint

1. Dans le dashboard Render, cliquez sur **"Blueprints"** dans le menu
2. Cliquez sur **"New Blueprint Instance"**
3. Sélectionnez votre repository `dva-trainer-web`
4. Render va automatiquement détecter le fichier `render.yaml` et afficher :
   - ✅ `dva-trainer-db` (PostgreSQL)
   - ✅ `dva-trainer-api` (NestJS Backend)
   - ✅ `dva-trainer-web` (Angular Frontend)
5. Cliquez sur **"Apply"** pour créer les services

### 3. Attendre le déploiement

Le déploiement prend environ 3-5 minutes. Surveillez les logs dans le dashboard Render.

### 4. Seeder la base de données (IMPORTANT)

Le backend est déployé mais la BDD est vide. Vous devez importer vos questions :

**Méthode 1 - Via le dashboard Render :**
1. Allez dans **Services** → `dva-trainer-api`
2. Cliquez sur l'onglet **"Shell"**
3. Téléchargez votre fichier JSON de questions :
```bash
curl -o /tmp/questions.json "URL_DU_FICHIER_JSON"
# ou si vous l'avez uploadé via Files tab :
# le fichier sera dans /var/render/
```
4. Exécutez le seed :
```bash
cd backend
export QUESTIONS_JSON_PATH=/tmp/questions.json
npm run db:seed
```

**Méthode 2 - En local puis export/import :**
```bash
# En local, seedez avec votre fichier
# Exportez la BDD locale
pg_dump -h localhost -p 5433 -U dva dva_trainer > backup.sql
# Importez sur Render via le dashboard (External Connection)
```

### 5. Vérifier le déploiement

Une fois tout déployé :

| Service | URL | Statut |
|---------|-----|--------|
| Frontend | `https://dva-trainer-web.onrender.com` | ✅ Vérifier affichage |
| Backend Health | `https://dva-trainer-api.onrender.com/api/health` | ✅ Doit retourner `{"ok":true}` |
| API | `https://dva-trainer-api.onrender.com/api/questions` | ✅ Liste des questions |

## 🔧 URLs de l'application déployée

| Environnement | URL |
|--------------|-----|
| **Production (Frontend)** | `https://dva-trainer-web.onrender.com` |
| **Production (API)** | `https://dva-trainer-api.onrender.com` |

## 📁 Fichiers créés/modifiés

```
render.yaml                           # Configuration Blueprint Render
DEPLOY.md                             # Documentation complète
dva-trainer-web/
├── backend/
│   └── start-prod.sh                 # Script démarrage production
└── frontend/
    ├── set-env.js                    # Génération config Angular
    ├── package.json                  # + script build:prod
    └── src/environments/
        └── environment.production.ts # Config API production
```

## ⚠️ Points importants

1. **Sleep mode** : Le backend gratuit "s'endort" après 15 min d'inactivité. Le premier accès peut prendre 30s.

2. **BDD** : La base PostgreSQL gratuite expire après 90 jours. Vous devrez la recréer (les données seront perdues sauf backup).

3. **Seeding** : N'oubliez pas d'importer vos questions après le premier déploiement !

## 🆘 Dépannage

| Problème | Solution |
|----------|----------|
| "Build failed" | Vérifier les logs Render, souvent un problème de dépendances |
| "Cannot connect to DB" | Vérifier que la BDD est bien créée et en statut "Available" |
| "CORS error" | Le frontend fait des requêtes vers localhost - attendre le rebuild |
| "No questions" | La BDD est vide, lancer le seed manuellement |

## 💰 Coûts

Actuellement : **GRATUIT**
- Si vous voulez éviter le sleep : Plan Starter à $7/mois pour le backend
- Si vous voulez une BDD permanente : Plan Starter à $15/mois

---

**Prochaine étape** : Suivre les instructions ci-dessus sur https://dashboard.render.com/

Une fois fait, l'application sera accessible publiquement sur Internet ! 🎉
