import { Injectable } from '@angular/core';

export interface GlossaryTerm {
  term: string;
  acronym: string;
  definition: string;
  analogy: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlossaryService {
  // Glossaire AWS intégré directement pour éviter le chargement async
  private glossary: GlossaryTerm[] = [
    {
      term: 'IAM',
      acronym: 'Identity and Access Management',
      definition: 'Service qui gère qui peut accéder à quoi sur AWS',
      analogy: 'Le système de badges et permissions du lycée'
    },
    {
      term: 'Lambda',
      acronym: '',
      definition: 'Service serverless qui exécute du code à la demande',
      analogy: 'Un robot qui exécute une tâche quand on l\'appelle, puis s\'arrête'
    },
    {
      term: 'VPC',
      acronym: 'Virtual Private Cloud',
      definition: 'Réseau virtuel isolé dans le cloud AWS',
      analogy: 'Un campus privé avec ses propres routes et bâtiments'
    },
    {
      term: 'S3',
      acronym: 'Simple Storage Service',
      definition: 'Service de stockage d\'objets (fichiers) dans le cloud',
      analogy: 'Un entrepôt de stockage infini pour fichiers'
    },
    {
      term: 'EC2',
      acronym: 'Elastic Compute Cloud',
      definition: 'Serveurs virtuels dans le cloud',
      analogy: 'Louer un ordinateur dans le cloud par heure'
    },
    {
      term: 'DynamoDB',
      acronym: '',
      definition: 'Base de données NoSQL clé-valeur, ultra-rapide',
      analogy: 'Un casier ultra-organisé où chaque objet a un numéro unique'
    },
    {
      term: 'SQS',
      acronym: 'Simple Queue Service',
      definition: 'Service de file d\'attente pour découpler les applications',
      analogy: 'Une boîte aux lettres où on dépose des messages à traiter plus tard'
    },
    {
      term: 'SNS',
      acronym: 'Simple Notification Service',
      definition: 'Service de notifications pub/sub',
      analogy: 'Un haut-parleur qui diffuse un message à tout le monde'
    },
    {
      term: 'CloudFront',
      acronym: '',
      definition: 'Réseau de distribution de contenu (CDN)',
      analogy: 'Des antennes relais dans chaque quartier pour avoir la TV plus vite'
    },
    {
      term: 'API Gateway',
      acronym: '',
      definition: 'Porte d\'entrée qui contrôle l\'accès aux applications',
      analogy: 'L\'entrée du lycée avec un surveillant qui vérifie les badges'
    },
    {
      term: 'KMS',
      acronym: 'Key Management Service',
      definition: 'Service pour créer et gérer les clés de chiffrement',
      analogy: 'Un coffre-fort numérique avec des clés sécurisées'
    },
    {
      term: 'CloudWatch',
      acronym: '',
      definition: 'Service qui surveille les applications et collecte des métriques',
      analogy: 'Les caméras de surveillance + le tableau d\'affichage des absences'
    },
    {
      term: 'CloudTrail',
      acronym: '',
      definition: 'Service qui enregistre toutes les actions faites sur AWS',
      analogy: 'Le registre de sécurité qui note qui est entré dans le lycée'
    },
    {
      term: 'Route 53',
      acronym: '',
      definition: 'Service DNS qui traduit les noms de domaine en adresses IP',
      analogy: 'L\'annuaire téléphonique qui traduit les noms en numéros'
    },
    {
      term: 'ELB',
      acronym: 'Elastic Load Balancer',
      definition: 'Répartiteur de trafic entre plusieurs serveurs',
      analogy: 'Le responsable de la cantine qui répartit les élèves sur les caisses'
    },
    {
      term: 'Auto Scaling',
      acronym: '',
      definition: 'Ajoute ou enlève automatiquement des serveurs selon la charge',
      analogy: 'Appeler des renforts à la cantine quand il y a la queue'
    },
    {
      term: 'RDS',
      acronym: 'Relational Database Service',
      definition: 'Service de bases de données relationnelles gérées',
      analogy: 'Une base de données SQL gérée par AWS (MySQL, PostgreSQL...)'
    },
    {
      term: 'ElastiCache',
      acronym: '',
      definition: 'Service de cache en mémoire (Redis/Memcached)',
      analogy: 'Un tableau blanc partagé où on écrit les infos les plus utilisées'
    },
    {
      term: 'Step Functions',
      acronym: '',
      definition: 'Service pour orchestrer des workflows avec plusieurs étapes',
      analogy: 'Le chef d\'orchestre qui coordonne plusieurs musiciens dans l\'ordre'
    },
    {
      term: 'EventBridge',
      acronym: '',
      definition: 'Service pour orchestrer des événements et déclencher des actions',
      analogy: 'Le système de sonnerie du lycée qui déclenche des actions à des heures précises'
    },
    {
      term: 'Secrets Manager',
      acronym: '',
      definition: 'Service pour stocker et faire tourner les mots de passe',
      analogy: 'Un coffre-fort qui tourne la clé automatiquement'
    },
    {
      term: 'Systems Manager',
      acronym: '',
      definition: 'Service pour gérer et automatiser les ressources AWS',
      analogy: 'Le bureau du proviseur qui gère tout le lycée'
    },
    {
      term: 'CodePipeline',
      acronym: '',
      definition: 'Orchestrateur CI/CD qui enchaîne les étapes (build → test → deploy)',
      analogy: 'Le planning qui enchaîne : écrire le cours → photocopier → distribuer'
    },
    {
      term: 'CodeBuild',
      acronym: '',
      definition: 'Service qui compile et teste le code automatiquement',
      analogy: 'Le robot qui assemble les pièces d\'un LEGO selon la notice'
    },
    {
      term: 'CodeDeploy',
      acronym: '',
      definition: 'Service qui déploie automatiquement le code sur les serveurs',
      analogy: 'Le système qui distribue les nouveaux manuels scolaires dans toutes les classes'
    },
    {
      term: 'CodeCommit',
      acronym: '',
      definition: 'Service de stockage de code source',
      analogy: 'Un Dropbox spécial pour le code, avec historique des modifications'
    },
    {
      term: 'Cognito',
      acronym: '',
      definition: 'Service d\'authentification et gestion des utilisateurs',
      analogy: 'Le système de badges du lycée qui reconnait les élèves, profs et visiteurs'
    },
    {
      term: 'SES',
      acronym: 'Simple Email Service',
      definition: 'Service d\'envoi d\'emails',
      analogy: 'La boîte aux lettres pour envoyer/recevoir des mails en masse'
    },
    {
      term: 'WAF',
      acronym: 'Web Application Firewall',
      definition: 'Pare-feu qui protège les applications web des attaques',
      analogy: 'Un vigile à l\'entrée qui vérifie que personne n\'apporte d\'objets dangereux'
    },
    {
      term: 'Kinesis',
      acronym: '',
      definition: 'Service pour ingérer et traiter des flux de données en temps réel',
      analogy: 'Un tapis roulant qui transporte des paquets à grande vitesse'
    },
    {
      term: 'ECS',
      acronym: 'Elastic Container Service',
      definition: 'Service pour faire tourner des conteneurs Docker à grande échelle',
      analogy: 'Un orchestre qui gère des musiciens identiques jouant la même partition'
    },
    {
      term: 'DAX',
      acronym: 'DynamoDB Accelerator',
      definition: 'Cache en mémoire pour DynamoDB qui accélère les lectures',
      analogy: 'Un petit coffre à côté de toi avec les objets les plus utilisés'
    },
    {
      term: 'GSI',
      acronym: 'Global Secondary Index',
      definition: 'Index alternatif sur DynamoDB pour rechercher partout',
      analogy: 'Un index à la fin du livre qui cherche sur toutes les pages'
    },
    {
      term: 'LSI',
      acronym: 'Local Secondary Index',
      definition: 'Index alternatif limité à une partition DynamoDB',
      analogy: 'Des onglets dans ton classeur, triés différemment'
    },
    {
      term: 'ARN',
      acronym: 'Amazon Resource Name',
      definition: 'Identifiant unique d\'une ressource AWS',
      analogy: 'L\'adresse postale complète d\'une salle de classe'
    },
    {
      term: 'AZ',
      acronym: 'Availability Zone',
      definition: 'Datacenter isolé dans une région AWS',
      analogy: 'Un bâtiment différent dans le même campus'
    },
    {
      term: 'ENI',
      acronym: 'Elastic Network Interface',
      definition: 'Interface réseau virtuelle attachée à un serveur',
      analogy: 'La prise réseau (RJ45) d\'un ordinateur, mais virtuelle'
    },
    {
      term: 'NACL',
      acronym: 'Network Access Control List',
      definition: 'Pare-feu de niveau sous-réseau',
      analogy: 'Le digicode de l\'immeuble (stateless = sans mémoire)'
    },
    {
      term: 'Security Group',
      acronym: '',
      definition: 'Pare-feu virtuel au niveau instance (serveur)',
      analogy: 'La porte d\'entrée de ton appartement (stateful = se souvient)'
    },
    {
      term: 'Subnet',
      acronym: '',
      definition: 'Sous-réseau qui divise un VPC en zones plus petites',
      analogy: 'Un étage spécifique dans un bâtiment du lycée'
    },
    {
      term: 'TTL',
      acronym: 'Time To Live',
      definition: 'Mécanisme pour supprimer automatiquement des données après un délai',
      analogy: 'Une date de péremption sur un produit, après laquelle il disparaît'
    },
    {
      term: 'EBS',
      acronym: 'Elastic Block Store',
      definition: 'Disque dur virtuel pour les serveurs EC2',
      analogy: 'Une clé USB virtuelle que tu branches sur ton serveur'
    },
    {
      term: 'AMI',
      acronym: 'Amazon Machine Image',
      definition: 'Modèle qui contient tout pour créer un serveur',
      analogy: 'Une recette de gâteau prête à l\'emploi'
    },
    {
      term: 'CRUD',
      acronym: 'Create, Read, Update, Delete',
      definition: 'Les 4 opérations de base sur une base de données',
      analogy: 'Les 4 actions de base sur un fichier : créer, lire, modifier, supprimer'
    },
    {
      term: 'API',
      acronym: 'Application Programming Interface',
      definition: 'Liste des commandes possibles qu\'un programme peut donner à un service',
      analogy: 'Le menu d\'un restaurant'
    },
    {
      term: 'Serverless',
      acronym: '',
      definition: 'Tu écris juste le code, AWS gère les serveurs pour toi',
      analogy: 'Utiliser un service sans avoir à acheter/réparer l\'appareil'
    },
    {
      term: 'AppConfig',
      acronym: '',
      definition: 'Service pour activer/désactiver des fonctionnalités sans redéployer',
      analogy: 'Les interrupteurs dans la salle des profs pour allumer/éteindre les projecteurs'
    },
    {
      term: 'AppSync',
      acronym: '',
      definition: 'Service pour créer des API qui synchronisent des données en temps réel',
      analogy: 'Un serveur qui synchronise les données entre ton téléphone et l\'ordinateur de l\'école'
    },
    {
      term: 'Lambda@Edge',
      acronym: '',
      definition: 'Lambda qui s\'exécute dans les points de présence CloudFront, près des utilisateurs',
      analogy: 'Un robot dans chaque antenne relais pour répondre plus vite'
    },
    {
      term: 'CloudFront Functions',
      acronym: '',
      definition: 'Fonctions légères qui s\'exécutent au niveau des edge locations',
      analogy: 'Le vigile à l\'entrée qui vérifie vite le billet (1ms max)'
    },
    {
      term: 'Feature Flag',
      acronym: '',
      definition: 'Mécanisme pour activer/désactiver des fonctionnalités à la volée',
      analogy: 'Un interrupteur pour activer/désactiver une nouvelle fonctionnalité'
    },
    {
      term: 'Athena',
      acronym: '',
      definition: 'Service pour analyser des données dans S3 avec du SQL, sans serveur',
      analogy: 'Le bibliothécaire qui trouve des infos dans des tonnes de livres en quelques secondes'
    },
    {
      term: 'SAM',
      acronym: 'Serverless Application Model',
      definition: 'Framework pour déployer facilement des applications Lambda',
      analogy: 'Un kit de construction simplifié pour applications serverless'
    }
  ];

  getTerm(term: string): GlossaryTerm | undefined {
    const normalizedTerm = term.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return this.glossary.find(t => 
      t.term.toUpperCase() === normalizedTerm ||
      t.acronym.toUpperCase() === normalizedTerm
    );
  }

  getAllTerms(): GlossaryTerm[] {
    return [...this.glossary];
  }

  // Parse le texte et remplace les termes AWS par des spans avec tooltip
  parseTextWithGlossary(text: string): string {
    if (!text) return '';
    
    let result = text;
    
    // Trier par longueur décroissante pour éviter les remplacements partiels
    const sortedTerms = [...this.glossary].sort((a, b) => b.term.length - a.term.length);
    
    for (const term of sortedTerms) {
      const regex = new RegExp(`\\b(${term.term})\\b`, 'gi');
      result = result.replace(regex, `<span class="glossary-term" data-term="${term.term}" title="${term.analogy}">$1</span>`);
    }
    
    return result;
  }
}
