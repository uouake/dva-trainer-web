# Plan d'action DVA Trainer - Correction et améliorations

## 1. Correction SPA Routing sur Render 🔴 CRITIQUE
**Agent**: render-spa-fix
**Tâche**: Le fichier `_redirects` ne fonctionne pas. Investiguer et fixer le routing SPA sur Render static site.
**Problème**: Refresh sur /dashboard, /routine, /examen = "Not Found"

## 2. Dark/Light Mode 🌓
**Agent**: theme-mode-dev
**Tâche**: Implémenter toggle dark/light/auto avec détection système. Persister le choix dans localStorage.

## 3. Intégration Glossaire 📚
**Agent**: glossary-integration-dev  
**Tâche**: Intégrer le glossaire existant dans l'interface. Ajouter tooltips sur les termes AWS dans les questions.

## 4. Formatage Explications HTML 📝
**Agent**: content-formatter
**Tâche**: Convertir les explications markdown (**bold**, *italic*, etc.) en HTML valide. Assurer un formatage cohérent sur toutes les 557 questions.

## 5. Tests Non-Régression & CI/CD 🧪
**Agent**: testing-ci-dev
**Tâche**: 
- Créer tests de non-régression pour les features critiques
- Mettre en place pipeline CI/CD GitHub Actions simple
- Vérifier que tous les tests passent avant déploiement

---

## Dépendances
- Tâche 1 (SPA routing) doit être faite avant les autres car bloquante
- Tâches 2, 3, 4 peuvent être parallèles
- Tâche 5 (tests) dépend des modifications faites

## Agent Orchestrateur
**Nom**: project-orchestrator
**Rôle**: Suivre l'avancement, lever des alertes si blocage, demander clarification si besoin
