// Mapping des conceptKey techniques vers des noms lisibles en français
export const CONCEPT_LABELS: Record<string, string> = {
  // S3
  's3-bucket': 'Buckets S3 (Stockage fichiers)',
  's3-versioning': 'Versionnement S3',
  's3-lifecycle': 'Règles de cycle de vie S3',
  's3-encryption': 'Chiffrement S3',
  's3-cors': 'CORS S3',
  
  // Lambda
  'lambda-function': 'Fonctions Lambda (Serverless)',
  'lambda-concurrency': 'Concurrence Lambda',
  'lambda-layers': 'Layers Lambda',
  'lambda-triggers': 'Déclencheurs Lambda',
  'lambda-limits': 'Limites Lambda (timeout, mémoire)',
  
  // DynamoDB
  'dynamodb-table': 'Tables DynamoDB',
  'dynamodb-indexes': 'Index DynamoDB (GSI/LSI)',
  'dynamodb-partition': 'Clés de partition DynamoDB',
  'dynamodb-ttl': 'TTL DynamoDB (Expiration)',
  'dynamodb-streams': 'Streams DynamoDB',
  
  // IAM
  'iam-role': 'Rôles IAM (Permissions)',
  'iam-policy': 'Policies IAM',
  'iam-user': 'Utilisateurs IAM',
  'iam-group': 'Groupes IAM',
  
  // API Gateway
  'api-gateway': 'API Gateway (Endpoints)',
  'api-gateway-stages': 'Stages API Gateway',
  'api-gateway-throttling': 'Limitation API Gateway',
  
  // CloudWatch - avec underscores
  'cloudwatch-logs': 'Logs CloudWatch',
  'cloudwatch-metrics': 'Métriques CloudWatch',
  'cloudwatch-alarms': 'Alarmes CloudWatch',
  'cloudwatch_logs_metrics': 'Logs et Métriques CloudWatch',
  
  // EC2 / ECS
  'ec2-instance': 'Instances EC2 (Serveurs)',
  'ecs-task': 'Tâches ECS (Conteneurs)',
  'ecs-service': 'Services ECS',
  
  // ECR
  'ecr-image-scanning': 'Scan d\'images ECR',
  'ecr_image_scanning': 'Scan d\'images ECR (Sécurité)',
  
  // SNS / SQS
  'sns-topic': 'Topics SNS (Notifications)',
  'sqs-queue': 'Files SQS (Messages)',
  'sqs-visibility-timeout': 'Timeout de visibilité SQS',
  'sqs_visibility_timeout': 'Timeout de visibilité SQS',
  
  // Cognito
  'cognito-user-pool': 'Pools d\'utilisateurs Cognito',
  'cognito-identity': 'Identités Cognito',
  
  // CloudFormation
  'cloudformation-stack': 'Stacks CloudFormation',
  
  // Code*
  'codecommit': 'CodeCommit (Git)',
  'codebuild': 'CodeBuild (CI/CD Build)',
  'codedeploy': 'CodeDeploy (Déploiement)',
  'codepipeline': 'CodePipeline (CI/CD Pipeline)',
  
  // RDS
  'rds-instance': 'Bases de données RDS',
  
  // ElastiCache
  'elasticache': 'Cache ElastiCache (Redis/Memcached)',
  
  // VPC / Networking
  'vpc': 'VPC (Réseau virtuel)',
  'subnet': 'Sous-réseaux',
  'security-group': 'Groupes de sécurité (Firewall)',
  
  // Route 53
  'route53': 'Route 53 (DNS)',
  
  // CloudFront
  'cloudfront': 'CloudFront (CDN)',
  
  // Secrets Manager
  'secrets-manager': 'Secrets Manager (Mots de passe)',
  'secrets_manager_vs_ssm': 'Secrets Manager vs SSM (Stockage secrets)',
  
  // Systems Manager
  'ssm-parameter': 'Paramètres Systems Manager',
  
  // EventBridge
  'eventbridge': 'EventBridge (Événements)',
  
  // Step Functions
  'step-functions': 'Step Functions (Workflows)',
  
  // X-Ray
  'xray': 'AWS X-Ray (Tracing)',
  
  // Kinesis
  'kinesis': 'Kinesis (Streaming données)',
  
  // AppConfig
  'appconfig': 'AppConfig (Configuration)',
  
  // Batch
  'batch': 'AWS Batch (Traitement par lots)',
  
  // SAM
  'sam': 'AWS SAM (Serverless Framework)',
  
  // CDK
  'cdk': 'AWS CDK (Infrastructure as Code)',
  
  // Cloud9
  'cloud9': 'Cloud9 (IDE Cloud)',
};

/**
 * Transforme une clé technique en nom lisible
 * Si la clé n'est pas dans le mapping, tente de formater intelligemment
 */
export function getConceptLabel(conceptKey: string): string {
  if (!conceptKey) return 'Concept inconnu';
  
  // Chercher dans le mapping
  if (CONCEPT_LABELS[conceptKey]) {
    return CONCEPT_LABELS[conceptKey];
  }
  
  // Fallback: formater la clé intelligemment
  // Remplacer underscores et tirets par des espaces
  const words = conceptKey
    .replace(/_/g, '-')
    .split('-')
    .filter(word => word.length > 0);
  
  // Mots à mettre en majuscule (acronymes AWS)
  const acronyms = ['iam', 'sns', 'sqs', 'rds', 'vpc', 'ec2', 'ecs', 's3', 'ssm', 'api', 'cdn', 'dns', 'url', 'arn', 'kms'];
  
  // Mots courants à traduire ou formater
  const translations: Record<string, string> = {
    'logs': 'Logs',
    'metrics': 'Métriques',
    'scanning': 'Scan',
    'scan': 'Scan',
    'visibility': 'Visibilité',
    'timeout': 'Timeout',
    'manager': 'Manager',
    'secrets': 'Secrets',
    'parameter': 'Paramètre',
    'image': 'Image',
    'vs': 'vs',
  };
  
  const formatted = words.map(word => {
    const lower = word.toLowerCase();
    
    // Si c'est un acronyme, le mettre en majuscule
    if (acronyms.includes(lower)) {
      return lower.toUpperCase();
    }
    
    // Si on a une traduction, l'utiliser
    if (translations[lower]) {
      return translations[lower];
    }
    
    // Sinon, première lettre en majuscule
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  return formatted.join(' ');
}
