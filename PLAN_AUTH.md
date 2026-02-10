# Plan d'implémentation - Authentification GitHub OAuth

## Agents à lancer

### 1. github-auth-backend
**Mission** : Implémenter l'authentification OAuth côté backend
- Intégrer Passport.js avec passport-github2
- Créer table `users` (id, githubId, email, name, avatar, createdAt)
- Modifier table `attempts` pour accepter userId (string, peut être UUID ou user_id)
- Endpoints : `/api/auth/github`, `/api/auth/github/callback`, `/api/auth/me`, `/api/auth/logout`
- Génération et validation JWT
- Garder compatibilité avec UUID anonymes existants

### 2. github-auth-frontend  
**Mission** : Interface de connexion et gestion auth côté frontend
- Page `/login` design cohérent avec l'app (fond bleu/gris, card centrale)
- Bouton "Se connecter avec GitHub" (style GitHub officiel)
- Service `AuthService` pour gérer les tokens JWT
- Interceptor HTTP pour ajouter le token aux requêtes
- Affichage utilisateur connecté dans la sidebar (avatar + nom)
- Bouton déconnexion

### 3. auth-migration
**Mission** : Gérer la migration des données existantes
- Les attempts existants avec UUID restent fonctionnels
- Nouvelle colonne `authType` ('anonymous' | 'github') dans users
- Script de migration si besoin
- Garantir zero perte de données

### 4. auth-tests
**Mission** : Tests de non-régression complets
- Test : Routine fonctionne sans auth (mode anonyme)
- Test : Examen fonctionne sans auth
- Test : Dashboard fonctionne sans auth
- Test : Connexion GitHub réussie
- Test : Données persistantes après connexion
- Test : Déconnexion fonctionne
- Test : Navigation protégée (si applicable)

### 5. auth-orchestrator
**Mission** : Suivi global et alertes

## Dépendances
- github-auth-backend doit être fait avant github-auth-frontend
- auth-migration peut être parallèle
- auth-tests en dernier

## Critères de succès
- [ ] Connexion GitHub fonctionne
- [ ] App fonctionne sans auth (rétrocompatibilité)
- [ ] Données existantes préservées
- [ ] Design cohérent
- [ ] Tous les tests passent
