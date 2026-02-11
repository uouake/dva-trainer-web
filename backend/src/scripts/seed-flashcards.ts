import { DataSource } from 'typeorm';
import { AppDataSource } from '../infrastructure/db/data-source';

const flashcards = [
  {
    conceptKey: 'lambda',
    front: "C'est quoi AWS Lambda ?",
    back: "Un Robot Cuisinier : il dort jusqu'à ce qu'on l'appelle, fait le travail, puis retourne dormir. Tu payes seulement quand il cuisine ! Serverless = pas de serveur à gérer.",
    category: 'Compute',
    difficulty: 1,
  },
  {
    conceptKey: 's3',
    front: "C'est quoi Amazon S3 ?",
    back: "Un Casier Scolaire Infini : tu peux y ranger TES affaires (photos, vidéos, documents). Chaque objet a une clé unique (comme le numéro du casier). Accessible de partout !",
    category: 'Storage',
    difficulty: 1,
  },
  {
    conceptKey: 'iam',
    front: "C'est quoi AWS IAM ?",
    back: "Les Badges d'Accès du lycée : chaque personne a son badge avec des permissions. Le badge du proviseur ouvre toutes les portes, celui d'un élève ouvre seulement sa classe.",
    category: 'Security',
    difficulty: 1,
  },
  {
    conceptKey: 'dynamodb',
    front: "C'est quoi DynamoDB ?",
    back: "Les Fiches Élèves Magiques : chaque fiche a un numéro unique (clé primaire). Quand tu cherches par ce numéro, c'est instantané ! Pas besoin de feuilleter tout le fichier.",
    category: 'Database',
    difficulty: 2,
  },
  {
    conceptKey: 'api-gateway',
    front: "C'est quoi API Gateway ?",
    back: "La Porte d'Entrée du lycée : tous les visiteurs passent par là. Elle vérifie qui peut entrer, redirige vers le bon bâtiment, et note qui est passé. Une seule entrée pour tout gérer !",
    category: 'Networking',
    difficulty: 2,
  },
  {
    conceptKey: 'secrets-manager',
    front: "C'est quoi AWS Secrets Manager ?",
    back: "Le Coffre-Fort du Proviseur : les mots de passe et codes secrets y sont rangés en sécurité. Même les profs ne les voient pas directement - l'app les récupère automatiquement quand besoin.",
    category: 'Security',
    difficulty: 2,
  },
  {
    conceptKey: 'sqs',
    front: "C'est quoi Amazon SQS ?",
    back: "La Boîte aux Lettres des Profs : les élèves déposent leurs devoirs (messages) dans la boîte. Le prof les récupère quand il veut, dans l'ordre. Si la boîte est pleine, les nouveaux attendent gentiment.",
    category: 'Messaging',
    difficulty: 2,
  },
  {
    conceptKey: 'sns',
    front: "C'est quoi Amazon SNS ?",
    back: "Le Haut-Parleur du Lycée : un message envoyé, tout le monde l'entend ! Les abonnés (élèves, profs) reçoivent l'alerte instantanément. Parfait pour les annonces urgentes.",
    category: 'Messaging',
    difficulty: 2,
  },
  {
    conceptKey: 'cloudwatch',
    front: "C'est quoi CloudWatch ?",
    back: "Les Caméras de Surveillance : elles regardent tout ce qui se passe dans le lycée. Si quelque chose d'anormal arrive (trop de monde, porte forcée), elles alertent immédiatement.",
    category: 'Monitoring',
    difficulty: 1,
  },
  {
    conceptKey: 'auto-scaling',
    front: "C'est quoi l'Auto Scaling ?",
    back: "L'Armée des Robots : quand il y a plus de travail, AWS envoie automatiquement plus de Robots Cuisiniers. Quand c'est calme, ils repartent dormir. Tu payes seulement ce que tu utilises !",
    category: 'Compute',
    difficulty: 2,
  },
  {
    conceptKey: 'vpc',
    front: "C'est quoi un VPC ?",
    back: "Le Campus Fortifié : un terrain privé avec mur d'enceinte. À l'intérieur, tu organises les bâtiments (zones) comme tu veux : public (entrée), privé (classes), sécurisé (coffre).",
    category: 'Networking',
    difficulty: 2,
  },
  {
    conceptKey: 'security-groups',
    front: "C'est quoi les Security Groups ?",
    back: "Les Badges d'Accès par Zone : ton badge élève ouvre la cantine mais pas le bureau du proviseur. Chaque zone a ses propres règles. On ne rentre que si on a le bon badge !",
    category: 'Security',
    difficulty: 2,
  },
  {
    conceptKey: 'ecs',
    front: "C'est quoi Amazon ECS ?",
    back: "Les Food Trucks : au lieu d'un restaurant fixe, tu as des camions cuisine que tu déplaces où tu veux. Tu en lances 10 à Paris, 20 à Lyon - ils se mettent en route automatiquement !",
    category: 'Compute',
    difficulty: 3,
  },
  {
    conceptKey: 'ecr',
    front: "C'est quoi Amazon ECR ?",
    back: "Le Garage à Food Trucks : c'est là que tu stockes tes camions prêts à partir. Quand tu veux lancer un service, tu récupères ton camion du garage et tu le déploies.",
    category: 'Compute',
    difficulty: 3,
  },
  {
    conceptKey: 'docker',
    front: "C'est quoi Docker ?",
    back: "La Recette du Food Truck : tu emballe TOUT ce qu'il faut dans ton camion (cuisine, ingrédients, ustensiles). Peu importe où tu vas, tu as tout pour cuisiner !",
    category: 'Compute',
    difficulty: 2,
  },
  {
    conceptKey: 'codepipeline',
    front: "C'est quoi CodePipeline ?",
    back: "L'Usine Automatique : tu modifies ta recette (code), l'usine construit ton Food Truck, le teste, et l'envoie sur la route. Si ça plante, elle revient à la version précédente toute seule !",
    category: 'DevOps',
    difficulty: 3,
  },
  {
    conceptKey: 'cloudfront',
    front: "C'est quoi CloudFront ?",
    back: "Le Réseau de Téléportation : ton application existe en plusieurs copies dans 50+ villes. Un utilisateur à Toulouse reçoit la copie de Toulouse, pas celle de Paris. Résultat : ultra rapide !",
    category: 'Networking',
    difficulty: 2,
  },
  {
    conceptKey: 'route53',
    front: "C'est quoi Route 53 ?",
    back: "L'Annuaire Téléphonique Intelligent : quand tu cherches 'lycee-kumo.fr', il te donne l'adresse exacte ET il t'envoie vers le serveur le plus proche de chez toi.",
    category: 'Networking',
    difficulty: 2,
  },
  {
    conceptKey: 'cognito',
    front: "C'est quoi Amazon Cognito ?",
    back: "Pronote pour ton App : les élèves se connectent avec leurs identifiants existants. Pas besoin de créer de nouveau mot de passe ! Cognito vérifie qui ils sont et gère les connexions.",
    category: 'Security',
    difficulty: 2,
  },
  {
    conceptKey: 'rds',
    front: "C'est quoi Amazon RDS ?",
    back: "La Bibliothèque Gérée : au lieu de gérer toi-même les étagères et les livres, quelqu'un le fait pour toi. Les mises à jour, les sauvegardes, la maintenance - tout est automatique !",
    category: 'Database',
    difficulty: 2,
  },
  {
    conceptKey: 'elasticache',
    front: "C'est quoi ElastiCache ?",
    back: "Le Tableau d'Affichage : au lieu de chercher dans le fichier à chaque fois, tu notes les infos fréquentes sur un tableau. La prochaine fois, c'est instantané ! (Mémoire cache)",
    category: 'Database',
    difficulty: 3,
  },
  {
    conceptKey: 'ec2',
    front: "C'est quoi Amazon EC2 ?",
    back: "Louer une Salle de Classe : tu loues l'espace, tu fais ce que tu veux dedans. Tu choisis la taille (petite salle / amphithéâtre) et tu payes à l'heure. C'est TA salle !",
    category: 'Compute',
    difficulty: 1,
  },
  {
    conceptKey: 'elastic-beanstalk',
    front: "C'est quoi Elastic Beanstalk ?",
    back: "Le Concierge qui Tout Gère : tu lui donnes ton app, il trouve la salle, installe les tables, configure tout. Tu n'as qu'à te concentrer sur ton cours, lui gère le reste !",
    category: 'Compute',
    difficulty: 2,
  },
  {
    conceptKey: 'kinesis',
    front: "C'est quoi Amazon Kinesis ?",
    back: "Le Tapis Roulant des Exposés : les élèves déposent leurs diapos en continu sur le tapis. Le prof les regarde en temps réel, dans l'ordre d'arrivée. Flux continu de données !",
    category: 'Analytics',
    difficulty: 3,
  },
  {
    conceptKey: 'step-functions',
    front: "C'est quoi Step Functions ?",
    back: "Le Guide du Parcours Scolaire : d'abord le contrôle, puis si tu as la moyenne tu passes en 2nde, sinon tu redoubles. Chaque étape dépend du résultat de la précédente.",
    category: 'Compute',
    difficulty: 3,
  },
  {
    conceptKey: 'eventbridge',
    front: "C'est quoi EventBridge ?",
    back: "Le Central d'Événements du Lycée : quand la sonnerie retentit (événement), ça déclenche plusieurs actions - les élèves changent de classe, le prof commence son cours, etc.",
    category: 'Compute',
    difficulty: 3,
  },
  {
    conceptKey: 'x-ray',
    front: "C'est quoi AWS X-Ray ?",
    back: "Le Détective du Lycée : quand un problème arrive, il suit la piste de l'élève (requête) partout où elle est passée. 'L'élève est arrivé à l'entrée, puis a attendu 5 min au CDI...'",
    category: 'Monitoring',
    difficulty: 3,
  },
  {
    conceptKey: 'waf',
    front: "C'est quoi AWS WAF ?",
    back: "Le Vigile Intelligent : il regarde qui entre dans le lycée. S'il voit quelqu'un douteux (trop grand, comportement bizarre), il le bloque avant qu'il n'entre. Protection contre les attaques !",
    category: 'Security',
    difficulty: 3,
  },
  {
    conceptKey: 'kms',
    front: "C'est quoi AWS KMS ?",
    back: "Le Crypteur de Messages Secrets : quand tu écris un message codé, seul celui qui a la clé peut le lire. Même si quelqu'un intercepte le message, il ne comprend rien !",
    category: 'Security',
    difficulty: 3,
  },
  {
    conceptKey: 'ebs',
    front: "C'est quoi Amazon EBS ?",
    back: "Le Classeur Magnétique : c'est l'endroit où tu ranges tes cours même quand l'ordinateur s'éteint. Au prochain démarrage, tes fichiers sont toujours là. Stockage persistant !",
    category: 'Storage',
    difficulty: 2,
  },
];

async function seedFlashcards() {
  console.log('🌱 Seeding flashcards...');
  
  try {
    await AppDataSource.initialize();
    console.log('📊 Database connected');

    const flashcardRepository = AppDataSource.getRepository('Flashcard');

    // Check if flashcards already exist
    const count = await flashcardRepository.count();
    if (count > 0) {
      console.log(`⚠️  ${count} flashcards already exist. Skipping...`);
      console.log('💡 Use "DELETE FROM flashcards;" first if you want to reseed.');
      return;
    }

    // Insert all flashcards
    for (const card of flashcards) {
      await flashcardRepository.save(card);
    }

    console.log(`✅ ${flashcards.length} flashcards seeded successfully!`);
    
  } catch (error) {
    console.error('❌ Error seeding flashcards:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

seedFlashcards();
