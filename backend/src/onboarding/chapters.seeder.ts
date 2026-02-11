import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChapterEntity } from '../infrastructure/db/chapter.entities';

// ChaptersSeeder
//
// Insère les chapitres de l'histoire manga AWS dans la base de données.

@Injectable()
export class ChaptersSeeder {
  private readonly logger = new Logger(ChaptersSeeder.name);

  constructor(
    @InjectRepository(ChapterEntity)
    private readonly chapterRepo: Repository<ChapterEntity>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Checking if chapters need to be seeded...');

    const count = await this.chapterRepo.count();
    if (count > 0) {
      this.logger.log(`Found ${count} chapters, skipping seed.`);
      return;
    }

    this.logger.log('Seeding chapters...');

    const chapters: Partial<ChapterEntity>[] = [
      // Prologue
      {
        number: 0,
        title: 'Prologue : Bienvenue au Cloud ☁️',
        type: 'prologue',
        order: 0,
        content: `# Prologue : Bienvenue au Cloud ☁️

**AWS. Amazon Web Services.** 

Imagine une entreprise géante qui possède des millions d'ordinateurs dans des hangars immenses à travers le monde. Au lieu d'acheter ton propre ordinateur cher et limité, tu peux louer une partie de ces machines... via Internet. C'est ça, le **Cloud**.

**Et le meilleur dans tout ça ?** Pour les étudiants et les petits projets, AWS offre un **Free Tier** — un niveau gratuit qui permet d'expérimenter sans payer.

---

Yuki, 16 ans, regardait son écran d'ordinateur avec détermination. Dans trois semaines, le lycée Kumo organiserait son festival annuel — trois jours de stands, de concerts et de compétitions. Et elle avait promis de créer une application pour gérer les inscriptions.

"C'est mission impossible," avait dit Kenji, le président du comité. "Tu es seule, et tu n'as pas de serveur."

Mais Yuki avait découvert quelque chose. Une porte d'entrée vers un monde où les ordinateurs ne coûtent que quand on les utilise.

Elle ouvrit son navigateur et tapa trois lettres : **A-W-S**.

"D'accord," murmura-t-elle. "Commençons."`,
        conceptKeys: ['aws_cloud', 'free_tier'],
      },

      // Chapitre 1 : Lambda + IAM + API Gateway
      {
        number: 1,
        title: 'Chapitre 1 : Le Robot Cuisinier 🍜',
        type: 'chapter',
        order: 1,
        content: `# Chapitre 1 : Le Robot Cuisinier 🍜

Le premier problème de Yuki était simple : comment faire fonctionner son application sans avoir d'ordinateur allumé 24h/24 ?

Elle découvrit alors le **Robot Cuisinier (Lambda)**. Imagine un chef robot qui dort dans sa cuisine jusqu'à ce que quelqu'un sonne. Dès qu'une commande arrive, il se réveille, prépare le plat en quelques secondes, puis retourne dormir.

"C'est exactement ce qu'il me faut !" s'exclama Yuki.

Elle créa son premier robot. Le code était simple : quand quelqu'un remplissait le formulaire, le robot enregistrait l'inscription. Elle testa avec ses propres informations.

**ERREUR.**

Le robot avait planté. Yuki avait oublié de vérifier si l'email était valide. Elle corrigea le code, ajouta une vérification, et retenta.

**ÇA MARCHE !**

Mais un problème surgit : comment empêcher n'importe qui d'utiliser son robot ? Elle découvrit les **Badges d'Accès (IAM)** :
- **Badge Vert** : Peut uniquement consulter
- **Badge Orange** : Peut s'inscrire
- **Badge Rouge** : Peut tout modifier

Yuki créa son système de Badges. Elle réalisa qu'elle venait de construire une **Porte d'Entrée (API Gateway)** — comme l'entrée du lycée avec un gardien qui vérifiait les badges.

"C'est comme quand je commande sur Uber Eats," se dit-elle. "L'appli est une interface entre moi et le restaurant."

Elle testa. L'inscription fonctionna. Elle testa avec un Badge Vert en essayant de modifier... **ACCÈS REFUSÉ**.

Mais alors qu'elle célébrait, elle regarda son vieux disque dur : 98% plein.

"Il me faut un casier plus grand."`,
        conceptKeys: ['lambda_execution', 'iam_roles', 'least_privilege', 'api_gateway'],
      },

      // Chapitre 2 : S3 + DynamoDB
      {
        number: 2,
        title: 'Chapitre 2 : Le Casier Scolaire Infini 🗄️',
        type: 'chapter',
        order: 2,
        content: `# Chapitre 2 : Le Casier Scolaire Infini 🗄️

Yuki contemplait son écran. Les premiers testeurs avaient uploadé des photos de leurs stands, et son ordinateur explosait. Et pire : Kenji lui avait envoyé un message : "J'ai montré l'appli au proviseur. Il veut une démo dans 48 heures."

**48 heures.**

Yuki découvrit le **Casier Scolaire Infini (S3)**. Ici, tu peux stocker TOUT. Photos, vidéos... L'espace est pratiquement illimité.

Elle uploada une photo de test. Le système lui retourna une clé unique : \`stands/musique/affiche.jpg\`

"C'est quoi cette clé étrange ?"

"C'est l'adresse exacte de ton fichier. Comme le numéro d'un casier scolaire."

Mais les inscriptions elles-mêmes — les noms, les emails — étaient différentes. Ce n'étaient pas des fichiers, mais des **données structurées**.

Yuki découvrit alors les **Fiches Élèves Magiques (DynamoDB)**. Des millions de fiches cartonnées, chacune avec un numéro unique. Quand elle cherchait "Inscription #2847", le système trouvait instantanément.

"Et si je veux chercher toutes les inscriptions pour le stand de musique ?"

"Tu crées un **index secondaire**. Comme un annuaire inversé."

Yuki travailla toute la nuit. À 3h du matin, tout fonctionnait. Les photos dans le Casier Infini, les données dans les Fiches Magiques.

Mais alors qu'elle allait fermer son ordinateur, deux notifications apparurent :

"ALERTE : Tentative d'accès non autorisée détectée."

Et un message privé sur son téléphone, d'un numéro inconnu :

"Belle appli. Dommage que ce soit si facile à pirater. — K"`,
        conceptKeys: ['s3_buckets', 's3_keys', 'dynamodb_keys', 'dynamodb_indexes'],
      },

      // Chapitre 3 : Secrets Manager + API Keys
      {
        number: 3,
        title: 'Chapitre 3 : Le Piège du Hacker 🎭',
        type: 'chapter',
        order: 3,
        content: `# Chapitre 3 : Le Piège du Hacker 🎭

Yuki paniqua. Son écran affichait des lignes de code défilant. Quelqu'un avait trouvé l'URL de son application et essayait de forcer l'entrée.

Elle regarda son code. Horreur. Elle avait écrit la clé d'accès aux Fiches Élèves Magiques directement dans le programme.

"Stupide !" s'écria-t-elle.

Elle chercha frénétiquement une solution. C'est alors qu'elle découvrit le **Coffre-Fort Numérique (Secrets Manager)**.

"C'est comme un coffre-fort dans ta chambre. Au lieu de laisser ton argent traîner sur la table, tu le mets dans le coffre."

Yuki créa son Coffre-Fort en urgence. Elle y déposa la clé d'accès, le mot de passe administrateur, et la **clé API** pour envoyer des emails.

"C'est quoi une clé API ?"

"C'est comme une carte d'identité pour que deux applications parlent entre elles."

Elle modifia son code. Plus aucune clé sensible n'apparaissait. Elle regarda les logs du Coffre-Fort. Trois tentatives d'accès avaient été bloquées.

"Bloqué," sourit-elle.

Mais son téléphone vibra. Nouveau message du numéro inconnu :

"Tu as été rapide. Mais le festival approche... On se reverra. — K"

Yuki frissonna. Ce "K" n'avait pas lâché l'affaire.

Au réveil, elle découvrit 50 nouvelles inscriptions... et aucune notification envoyée aux organisateurs. Les présidents de stands ne savaient même pas qu'ils avaient des candidats.

"Il me faut un système de messagerie."`,
        conceptKeys: ['secrets_manager', 'api_keys', 'credentials'],
      },

      // Chapitre 4 : SQS + SNS
      {
        number: 4,
        title: 'Chapitre 4 : Les Messagers du Lycée 📬',
        type: 'chapter',
        order: 4,
        content: `# Chapitre 4 : Les Messagers du Lycée 📬

Yuki devait trouver un moyen de connecter son Robot Cuisinier aux présidents de stands.

Elle découvrit alors les deux Messagers du Lycée.

**La Boîte aux Lettres (SQS)** : Ton robot dépose un message. Le président du stand passe quand il veut, ouvre la boîte, récupère le message. Un seul destinataire.

**Le Haut-Parleur (SNS)** : Ton robot annonce : "Concert ce soir à 18h !" TOUT LE MONDE entend en même temps.

Yuki réfléchit. Pour les inscriptions spécifiques à un stand, elle utiliserait la **Boîte aux Lettres**. Pour les annonces générales, le **Haut-Parleur**.

Elle configura son système. Test. Échec. Elle avait oublié de lier le Haut-Parleur aux numéros de téléphone. Elle corrigea, retenta.

**Notification reçue !** Le président du stand de musique venait de recevoir un SMS.

Elle montra à Kenji. Il testa avec son téléphone... et planta.

"ERREUR 502 - Service Indisponible"

Trois cents élèves venaient d'essayer de s'inscrire suite à l'annonce de Kenji. L'application venait de s'effondrer.

"Le festival est dans trois jours," dit Kenji, blême. "Je suis désolé, j'aurais pas dû annoncer sans te demander."

Yuki le regarda. Pour la première fois, il reconnaissait avoir fait une erreur.

"On va réparer ensemble," dit-elle.`,
        conceptKeys: ['sqs_queue', 'sqs_dlq', 'sns_topic'],
      },

      // Chapitre 5 : CloudWatch + Auto-Scaling + DDOS
      {
        number: 5,
        title: "Chapitre 5 : L'Armée des Robots 🎖️",
        type: 'chapter',
        order: 5,
        content: `# Chapitre 5 : L'Armée des Robots 🎖️

La nuit suivant le crash, Yuki et Kenji étaient devant l'écran. Yuki avait expliqué le problème : un seul Robot Cuisinier ne pouvait pas gérer 300 requêtes simultanées.

"Il nous faut une armée," dit Yuki.

Elle découvrit l'**Auto-Scaling**. Quand il y a trop de monde, le Robot Cuisinier se multiplie automatiquement.

"Imagine une armée de robots identiques. Quand il y a peu de monde, un seul suffit. Quand la cantine est bondée, dix robots se mettent au travail."

"Et ça coûte cher ?" demanda Kenji.

"Avec le Free Tier, les premiers milliers de requêtes sont gratuites."

Yuki configura les alertes. Si plus de 50 personnes étaient connectées, l'Auto-Scaling déclencherait de nouveaux robots.

Soudain, son téléphone vibra. Message de "K" :

"Tu as résolu le problème de charge ? Impressionnant. Mais regardons si ton système tient contre ça..."

Une seconde plus tard, le **Tableau de Bord du Proviseur (CloudWatch)** afficha une alerte rouge : quelqu'un essayait de saturer l'application avec des milliers de requêtes fausses.

"C'est une attaque DDOS !" s'écria Yuki.

Mais cette fois, elle était prête. L'**Armée des Robots** se déploya automatiquement. Un robot, puis deux, puis dix. L'application absorba l'attaque sans ralentir.

"Bloqué," sourit Yuki, en regardant son téléphone.

Pas de réponse de "K".

Le jour du festival arriva. 14h : 200 utilisateurs. 15h : 500 utilisateurs. Les robots se multipliaient automatiquement.

À 16h, le pic d'affluence : **847 utilisateurs simultanés**. L'application ne ralentit même pas.

Kenji s'approcha, les yeux brillants.

"Tu as sauvé le festival," dit-il. "Et... je suis désolé d'avoir douté de toi au début."

Yuki sourit. "Sans ton annonce précipitée, j'aurais jamais découvert l'Auto-Scaling."

Un élève s'approcha, émerveillé. "C'est toi qui as créé l'appli ? C'est génial ! Tu pourrais m'apprendre ?"

Yuki regarda l'application fonctionner parfaitement.

"Je crois que je viens de trouver ma vocation."`,
        conceptKeys: ['cloudwatch_logs', 'cloudwatch_alarms', 'autoscaling', 'aws_security'],
      },

      // Épilogue
      {
        number: 6,
        title: 'Épilogue : Architecture de l\'App 🏗️',
        type: 'epilogue',
        order: 6,
        content: `# Épilogue : Architecture de l'App 🏗️

Voici comment tous les services se connectent :

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    L'APPLICATION FESTIVAL                    │
└─────────────────────────────────────────────────────────────┘

    UTILISATEUR (Élève avec son téléphone)
              │
              ▼
    ┌─────────────────────┐
    │   PORTE D'ENTRÉE    │  ← API Gateway (contrôle d'accès)
    │   AVEC GARDIEN      │     Vérifie les Badges (IAM)
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │   ROBOT CUISINIER   │  ← Lambda (s'exécute sur demande)
    │      (Lambda)       │     Armée de robots (Auto-Scaling)
    └──────────┬──────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌──────────────┐  ┌──────────────┐
│  COFFRE-FORT │  │   CASIER     │  ← S3 (stockage fichiers)
│   NUMÉRIQUE  │  │   INFINI     │
│(Secrets Mgr) │  │    (S3)      │
└──────────────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│   FICHES     │  ← DynamoDB (base de données)
│  ÉLÈVES      │
│ (DynamoDB)   │
└──────┬───────┘
       │
       └──────► ┌──────────────┐  ← SQS (file d'attente)
                │    BOÎTE     │
                │   AUX LETTRES│
                └──────────────┘
                
                ┌──────────────┐  ← SNS (notifications)
                │  HAUT-PARLEUR│
                │    (SNS)     │
                └──────────────┘

┌─────────────────────────────────────────────────────────────┐
│              TABLEAU DE BORD DU PROVISEUR                   │
│                  (CloudWatch + Auto-Scaling)                │
│   • Surveille les performances                              │
│   • Déclenche l'armée de robots si besoin                   │
│   • Détecte les attaques (DDOS)                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## Mapping Concepts → Questions DVA-C02

| Chapitre | Concept AWS | Nom dans l'histoire | Concept Keys |
|----------|-------------|---------------------|--------------|
| **Prologue** | AWS / Cloud / Free Tier | - | aws_cloud, free_tier |
| **Chapitre 1** | Lambda | Robot Cuisinier | lambda_execution |
| | IAM | Badges d'Accès | iam_roles, least_privilege |
| | API Gateway | Porte d'Entrée | api_gateway |
| **Chapitre 2** | S3 | Casier Infini | s3_buckets, s3_keys |
| | DynamoDB | Fiches Élèves | dynamodb_keys, dynamodb_indexes |
| **Chapitre 3** | Secrets Manager | Coffre-Fort Numérique | secrets_manager |
| | API Keys | Clés d'accès | api_keys, credentials |
| **Chapitre 4** | SQS | Boîte aux Lettres | sqs_queue, sqs_dlq |
| | SNS | Haut-Parleur | sns_topic |
| **Chapitre 5** | CloudWatch | Tableau de Bord | cloudwatch_logs, cloudwatch_alarms |
| | Auto Scaling | Armée de Robots | autoscaling |
| | DDOS Protection | Défense contre K | aws_security |

---

Félicitations ! Tu as terminé l'histoire AWS. Tu es maintenant prêt pour l'examen DVA-C02 ! 🎉`,
        conceptKeys: [],
      },
    ];

    for (const chapterData of chapters) {
      const chapter = this.chapterRepo.create(chapterData);
      await this.chapterRepo.save(chapter);
      this.logger.log(`Created chapter: ${chapter.title}`);
    }

    this.logger.log(`Seeded ${chapters.length} chapters successfully.`);
  }
}
