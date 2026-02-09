# 📚 Glossaire AWS - DVA Trainer

## A

**AMI (Amazon Machine Image)**
> *Analogie : Une recette de gâteau prête à l'emploi.*
> C'est un modèle qui contient tout ce qu'il faut pour créer un serveur (EC2) : le système d'exploitation, les logiciels, la configuration.

**API (Application Programming Interface)**
> *Analogie : Le menu d'un restaurant.*
> C'est la liste des commandes possibles qu'un programme peut donner à un service. Tu demandes quelque chose, l'API te répond.

**API Gateway**
> *Analogie : L'entrée principale du lycée avec un surveillant.*
> C'est la porte d'entrée qui contrôle qui peut accéder à tes applications. Il vérifie les badges (authentification) et note qui passe (logs).

**AppConfig**
> *Analogie : Les interrupteurs dans la salle des profs pour allumer/éteindre les projecteurs.*
> Service pour activer/désactiver des fonctionnalités (feature flags) sans redéployer l'application.

**AppSync**
> *Analogie : Un serveur qui synchronise les données entre ton téléphone et l'ordinateur de l'école.*
> Service pour créer des API qui synchronisent des données en temps réel entre apps.

**ARN (Amazon Resource Name)**
> *Analogie : L'adresse postale complète d'une salle de classe.*
> Identifiant unique d'une ressource AWS. Format : `arn:aws:service:region:account:resource`

**Athena**
> *Analogie : Le bibliothécaire qui trouve des infos dans des tonnes de livres en quelques secondes.*
> Service pour analyser des données dans S3 avec du SQL, sans serveur.

**Auto Scaling**
> *Analogie : Appeler des renforts à la cantine quand il y a la queue.*
> Ajoute ou enlève automatiquement des serveurs selon la charge.

**Availability Zone (AZ)**
> *Analogie : Un bâtiment différent dans le même campus.*
> Datacenter isolé dans une région AWS. Plusieurs AZ = redondance.

---

## C

**CloudFront**
> *Analogie : Des antennes relais dans chaque quartier pour avoir la TV plus vite.*
> Réseau de distribution de contenu (CDN). Met en cache tes fichiers près des utilisateurs pour aller plus vite.

**CloudTrail**
> *Analogie : Le registre de sécurité qui note qui est entré dans le lycée et à quelle heure.*
> Service qui enregistre TOUTES les actions faites sur AWS (qui a fait quoi, quand).

**CloudWatch**
> *Analogie : Les caméras de surveillance + le tableau d'affichage des absences.*
> Service qui surveille tes applications et collecte des métriques (logs, performances).

**CodeArtifact**
> *Analogie : L'armoire où les profs stockent les fournitures partagées.*
> Stockage pour les packages et librairies de code partagées.

**CodeBuild**
> *Analogie : Le robot qui assemble les pièces d'un LEGO selon la notice.*
> Service qui compile et teste ton code automatiquement.

**CodeCommit**
> *Analogie : Un Dropbox spécial pour le code, avec historique des modifications.*
> Service de stockage de code source (comme GitHub).

**CodeDeploy**
> *Analogie : Le système qui distribue les nouveaux manuels scolaires dans toutes les classes.*
> Service qui déploie automatiquement ton code sur tes serveurs.

**CodePipeline**
> *Analogie : Le planning qui enchaîne : écrire le cours → photocopier → distribuer.*
> Orchestrateur CI/CD qui enchaîne les étapes (build → test → deploy).

**Cognito**
> *Analogie : Le système de badges du lycée qui reconnait les élèves, profs et visiteurs.*
> Service d'authentification et gestion des utilisateurs.

**CRUD (Create, Read, Update, Delete)**
> *Analogie : Les 4 actions de base sur un fichier : créer, lire, modifier, supprimer.*
> Les 4 opérations de base sur une base de données.

---

## D

**DAX (DynamoDB Accelerator)**
> *Analogie : Un petit coffre à côté de toi avec les objets les plus utilisés, au lieu d'aller à l'entrepôt.*
> Cache en mémoire pour DynamoDB qui accélère les lectures.

**DynamoDB**
> *Analogie : Un casier ultra-organisé où chaque objet a un numéro unique.*
> Base de données NoSQL clé-valeur, ultra-rapide et serverless.

---

## E

**EBS (Elastic Block Store)**
> *Analogie : Une clé USB virtuelle que tu branches sur ton serveur.*
> Disque dur virtuel pour les serveurs EC2.

**EC2 (Elastic Compute Cloud)**
> *Analogie : Louer un ordinateur dans le cloud par heure.*
> Serveurs virtuels dans le cloud.

**ECS (Elastic Container Service)**
> *Analogie : Un orchestre qui gère des musiciens identiques jouant la même partition.*
> Service pour faire tourner des conteneurs Docker à grande échelle.

**ElastiCache**
> *Analogie : Un tableau blanc partagé où on écrit les infos les plus utilisées.*
> Service de cache en mémoire (Redis/Memcached) pour accélérer les applications.

**ELB (Elastic Load Balancer)**
> *Analogie : Le responsable de la cantine qui répartit les élèves sur les différentes caisses.*
> Répartiteur de trafic entre plusieurs serveurs.

**ENI (Elastic Network Interface)**
> *Analogie : La prise réseau (RJ45) d'un ordinateur, mais virtuelle.*
> Interface réseau virtuelle attachée à un serveur EC2.

**EventBridge**
> *Analogie : Le système de sonnerie du lycée qui déclenche des actions à des heures précises.*
> Service pour orchestrer des événements et déclencher des actions planifiées.

---

## F

**Feature Flag**
> *Analogie : Un interrupteur pour activer/désactiver une nouvelle fonctionnalité sans changer le code.*
> Mécanisme pour activer/désactiver des fonctionnalités à la volée.

---

## G

**GSI (Global Secondary Index)**
> *Analogie : Un deuxième catalogue dans la bibliothèque, trié différemment du premier.*
> Index alternatif sur DynamoDB pour rechercher par d'autres critères (peut être sur toute la table).

---

## I

**IAM (Identity and Access Management)**
> *Analogie : Le système de badges et permissions du lycée.*
> Service qui gère qui peut accéder à quoi sur AWS (utilisateurs, rôles, permissions).

**IAM Role**
> *Analogie : Un badge temporaire avec des permissions spécifiques.*
> Ensemble de permissions temporaires attribuées à un utilisateur ou service.

**IAM User**
> *Analogie : Une carte d'identité permanente d'un élève ou prof.*
> Compte utilisateur avec identifiants fixes.

**Instance**
> *Analogie : Un ordinateur virtuel en cours d'exécution.*
> Serveur EC2 en cours de fonctionnement.

---

## K

**Kinesis**
> *Analogie : Un tapis roulant qui transporte des paquets à grande vitesse.*
> Service pour ingérer et traiter des flux de données en temps réel.

**KMS (Key Management Service)**
> *Analogie : Un coffre-fort numérique avec des clés sécurisées.*
> Service pour créer et gérer les clés de chiffrement.

---

## L

**Lambda**
> *Analogie : Un robot qui exécute une tâche quand on l'appelle, puis s'arrête.*
> Service serverless qui exécute du code à la demande, sans serveur à gérer.

**Lambda@Edge**
> *Analogie : Un robot dans chaque antenne relais pour répondre plus vite.*
> Lambda qui s'exécute dans les points de présence CloudFront, près des utilisateurs.

**Lifecycle Policy**
> *Analogie : La règle "les devoirs de plus d'1 an vont au recyclage".*
> Règle qui définit quand supprimer ou archiver automatiquement des données.

**LSI (Local Secondary Index)**
> *Analogie : Un sous-classement dans un seul tiroir du casier.*
> Index alternatif sur DynamoDB limité à une partition (même clé de partition, tri différent).

---

## N

**Network ACL**
> *Analogie : Les règles de sécurité à l'entrée du lycée (périphérie).* 
> Pare-feu de niveau sous-réseau, moins granulaire que les Security Groups.

---

## R

**RDS (Relational Database Service)**
> *Analogie : Une base de données SQL gérée par AWS (MySQL, PostgreSQL, etc.).*
> Service de bases de données relationnelles gérées.

**Region**
> *Analogie : Un pays différent avec son propre datacenter.*
> Zone géographique AWS contenant plusieurs datacenters (AZ).

**Route 53**
> *Analogie : L'annuaire téléphonique qui traduit les noms en numéros.*
> Service DNS qui traduit les noms de domaine en adresses IP.

---

## S

**S3 (Simple Storage Service)**
> *Analogie : Un entrepôt de stockage infini pour fichiers.*
> Service de stockage d'objets (fichiers) dans le cloud.

**SAM (Serverless Application Model)**
> *Analogie : Un kit de construction simplifié pour applications serverless.*
> Framework pour déployer facilement des applications Lambda.

**Secrets Manager**
> *Analogie : Un coffre-fort qui tourne la clé automatiquement.*
> Service pour stocker et faire tourner (rotation) les mots de passe et secrets.

**Security Group**
> *Analogie : Les règles de sécurité à l'entrée d'une salle de classe (granulaire).*
> Pare-feu virtuel au niveau instance (serveur), très granulaire.

**Serverless**
> *Analogie : Utiliser un service sans avoir à acheter/réparer l'appareil.*
> Tu écris juste le code, AWS gère les serveurs pour toi.

**SES (Simple Email Service)**
> *Analogie : La boîte aux lettres pour envoyer/recevoir des mails en masse.*
> Service d'envoi d'emails.

**SNS (Simple Notification Service)**
> *Analogie : Un haut-parleur qui diffuse un message à tout le monde.*
> Service de notifications pub/sub (1 message → plusieurs destinataires).

**SQS (Simple Queue Service)**
> *Analogie : Une boîte aux lettres où on dépose des messages à traiter plus tard.*
> Service de file d'attente pour découpler les applications.

**Step Functions**
> *Analogie : Le chef d'orchestre qui coordonne plusieurs musiciens dans l'ordre.*
> Service pour orchestrer des workflows avec plusieurs étapes.

**Subnet**
> *Analogie : Un étage spécifique dans un bâtiment du lycée.*
> Sous-réseau qui divise un VPC en zones plus petites.

---

## T

**TTL (Time To Live)**
> *Analogie : Une date de péremption sur un produit, après laquelle il disparaît.*
> Mécanisme pour supprimer automatiquement des données après un délai.

---

## V

**VPC (Virtual Private Cloud)**
> *Analogie : Un campus privé avec ses propres routes, bâtiments et règles de sécurité.*
> Réseau virtuel isolé dans le cloud AWS.

**VPN (Virtual Private Network)**
> *Analogie : Un tunnel sécurisé entre deux endroits pour transporter des secrets.*
> Connexion sécurisée chiffrée entre deux réseaux.

---

## W

**WAF (Web Application Firewall)**
> *Analogie : Un vigile à l'entrée qui vérifie que personne n'apporte d'objets dangereux.*
> Pare-feu qui protège les applications web des attaques (SQL injection, XSS).

---

*Glossaire créé pour DVA Trainer - Version 1.0*
*Chaque terme inclut : Définition technique + Analogie quotidienne*
