import 'dotenv/config';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Script pour améliorer les explications pédagogiques problématiques
// basé sur les retours des tests adolescents

type Question = {
  id: string;
  exam: string;
  topic: number;
  questionNumber: number;
  stem: string;
  choices: Record<string, string>;
  answer: string;
  conceptKey: string;
  domainKey?: string;
  frExplanation: string;
  frExplanationPedagogique?: string;
  sourceUrl: string;
  textHash: string;
  isActive?: boolean;
};

type Bank = { questions: Question[] };

// Explications améliorées basées sur les retours des ados
const improvedExplanations: Record<string, string> = {
  // Feature Flags / AppSync vs AppConfig
  'appconfig_feature_flags': `**🎮 Imagine ton jeu vidéo favori** : les développeurs veulent tester une nouvelle arme légendaire avec seulement 10% des joueurs.

**AppConfig** = C'est comme **les mises à jour silencieuses** 🔄 - Active/désactive des fonctionnalités sans changer le code (interrupteurs).

**AppSync** = C'est comme **les paramètres du jeu en ligne** ⚙️ - Gère QUI voit QUOI en temps réel ("Montre la nouvelle arme aux joueurs VIP").

**🧠 Mnémotechnique :** "App**Config** = **CONFiguration** discrète" | "App**Sync** = **SYNChronise** les joueurs"

**Pourquoi AppConfig ici :** C'est pour activer/désactiver des boutons/fonctionnalités, pas pour synchroniser des données entre utilisateurs.`,

  // Lambda Version vs Alias
  'lambda_version_alias': `**🍔 Imagine une chaîne de resto fast-food** : plusieurs recettes de burger qui évoluent.

**Version** = C'est comme **le numéro de recette imprimé** 📜 - Immuable, gravé dans le marbre (v1 = classique, v2 = nouvelle).

**Alias** = C'est comme **les pancartes "SPÉCIALITÉ DU MOMENT"** 🪧 - Pointe vers une version, changeable ("prod" → v2, "beta" → v3).

**🧠 Mnémotechnique :** "**VER**sion = **VER**rouillé (chiffre fixe)" | "**AL**ias = **AL**ternatif (étiquette mobile)"

**Pourquoi créer une version :** Pour figer l'ancien code avant de modifier, pouvoir revenir en arrière si problème.`,

  // DynamoDB GSI vs LSI
  'dynamodb_gsi_lsi': `**🎒 Imagine ton casier au lycée** : tu ranges tes affaires différemment selon comment tu les cherches.

**LSI (Local)** = C'est comme **des onglets DANS ton classeur** 📁 - Créés à la rentrée, jamais modifiables, super rapides (même partition).

**GSI (Global)** = C'est comme **un index à la fin du livre** 📖 - Ajoutable n'importe quand, cherche partout, mais plus lent.

**🧠 Mnémotechnique :** "**L**SI = **L**ocal, **L**imité" | "**G**SI = **G**lobal, **G**énial"

**Quand utiliser GSI :** Quand tu veux chercher par un autre critère que la clé principale, sur TOUTE la table.`,

  // Lambda@Edge vs CloudFront Functions
  'lambda_edge_cff': `**🎪 Imagine des gardiens dans un festival** : certains vérifient vite, d'autres fouillent en profondeur.

**CloudFront Functions** = **Le vigile à l'entrée** 👮 - Vérifie vite le billet (URL, headers), ultra rapide (1ms), mais simple.

**Lambda@Edge** = **Le contrôle sécurité complet** 🛂 - Peut fouiller le sac, appeler une base (30s max), plus lent mais puissant.

**🧠 Mnémotechnique :** "**F**unctions = **F**aibles mais **F**rénétiques (rapides)" | "**L**ambda = **L**ourd mais **L**imité"

**Pourquoi Lambda@Edge ici :** Car on doit appeler AWS STS (service externe), impossible avec Functions.`,

  // IAM / Credentials
  'iam_credentials': `**🎡 Imagine un parc d'attractions** : bracelet qui détermine où tu peux aller.

**Credentials** = **Ton bracelet d'entrée** 🎟️ - Prouve qui tu es (clé d'accès = identité).

**IAM Role** = **Ton pass VIP/Standard/Enfant** 🎫 - Détermine OÙ tu peux aller (permissions).

**🧠 Mnémotechnique :** "**C**redentials = **C**arte d'identité (qui es-tu ?)" | "**IAM** = **J**e peux **A**ller **M** où ?"

**Pourquoi un rôle :** Pour ne PAS mettre de secrets dans le code. Le rôle donne des permissions temporaires, renouvelées automatiquement.`,

  // VPC / Sécurité
  'vpc_security': `**🏰 Imagine ton immeuble résidentiel** : plusieurs appartements avec systèmes de sécurité.

**VPC** = **Tout l'immeuble** 🏢 - Ton terrain privé dans le cloud.

**Subnet** = **Chaque étage** 🏠 - Public (rdc) ou Privé (résidents).

**Security Group** = **La porte de ton appart** 🚪 - Qui peut frapper ? (Stateful = se souvient des entrées).

**NACL** = **Le digicode de l'étage** 🔢 - Filtre au niveau de l'étage (Stateless = sans mémoire).

**🧠 Mnémotechnique :** "**S**G = **S**ouviens des connexions" | "**N**ACL = **N**e souviens de **R**ien"

**Quoi vérifier d'abord :** Le badge de l'EC2 (rôle IAM) autorise-t-il S3 ? Puis la policy du bucket S3.`,
};

function matchesConcept(question: Question, conceptKeys: string[]): boolean {
  return conceptKeys.some(k => 
    question.conceptKey.toLowerCase().includes(k.toLowerCase()) ||
    question.stem.toLowerCase().includes(k.toLowerCase())
  );
}

function getImprovedExplanation(question: Question): string | null {
  // Feature flags / AppConfig vs AppSync
  if (matchesConcept(question, ['feature', 'flag', 'appsync', 'appconfig'])) {
    return improvedExplanations['appconfig_feature_flags'];
  }
  
  // Lambda version/alias
  if (matchesConcept(question, ['lambda', 'version', 'alias']) && 
      (question.stem.toLowerCase().includes('version') || question.stem.toLowerCase().includes('alias'))) {
    return improvedExplanations['lambda_version_alias'];
  }
  
  // DynamoDB GSI/LSI
  if (matchesConcept(question, ['dynamodb', 'gsi', 'lsi', 'index']) &&
      (question.stem.toLowerCase().includes('index') || question.stem.toLowerCase().includes('secondary'))) {
    return improvedExplanations['dynamodb_gsi_lsi'];
  }
  
  // Lambda@Edge
  if (matchesConcept(question, ['lambda', 'edge', 'cloudfront']) &&
      question.stem.toLowerCase().includes('credentials')) {
    return improvedExplanations['lambda_edge_cff'];
  }
  
  // IAM / Credentials
  if (matchesConcept(question, ['iam', 'credentials', 'role', 'security']) &&
      (question.stem.toLowerCase().includes('credential') || question.stem.toLowerCase().includes('token'))) {
    return improvedExplanations['iam_credentials'];
  }
  
  // VPC / Security
  if (matchesConcept(question, ['vpc', 'security', 'subnet', 'ec2']) &&
      (question.stem.toLowerCase().includes('access') || question.stem.toLowerCase().includes('security'))) {
    return improvedExplanations['vpc_security'];
  }
  
  return null;
}

async function main() {
  const inputPath = process.env.INPUT ?? resolve(process.cwd(), '..', 'examtopics-downloader', 'dva-c02.questions.fr.pedagogique.json');
  const outputPath = process.env.OUTPUT ?? resolve(process.cwd(), '..', 'examtopics-downloader', 'dva-c02.questions.fr.improved.json');

  if (!existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const raw = readFileSync(inputPath, 'utf-8');
  const parsed = JSON.parse(raw) as Bank;
  
  let improved = 0;
  
  for (const q of parsed.questions) {
    const newExplanation = getImprovedExplanation(q);
    if (newExplanation) {
      q.frExplanationPedagogique = newExplanation;
      improved++;
      console.log(`[IMPROVED] ${q.id} (${q.conceptKey})`);
    }
  }
  
  writeFileSync(outputPath, JSON.stringify(parsed, null, 2));
  console.log(`\n✅ Done! Improved ${improved} explanations.`);
  console.log(`Output: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
