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
  
  // CloudWatch
  'cloudwatch-logs': 'Logs CloudWatch',
  'cloudwatch-metrics': 'Métriques CloudWatch',
  'cloudwatch-alarms': 'Alarmes CloudWatch',
  
  // EC2 / ECS
  'ec2-instance': 'Instances EC2 (Serveurs)',
  'ecs-task': 'Tâches ECS (Conteneurs)',
  'ecs-service': 'Services ECS',
  
  // SNS / SQS
  'sns-topic': 'Topics SNS (Notifications)',
  'sqs-queue': 'Files SQS (Messages)',
  
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
  
  // Systems Manager
  'ssm-parameter': 'Paramètres Systems Manager',
  
  // EventBridge
  'eventbridge': 'EventBridge (Événements)',
  
  // Step Functions
  'step-functions': 'Step Functions (Workflows)',
};

/**
 * Transforme une clé technique en nom lisible
 * Si la clé n'est pas dans le mapping, retourne la clé formatée
 */
export function getConceptLabel(conceptKey: string): string {
  // Chercher dans le mapping
  if (CONCEPT_LABELS[conceptKey]) {
    return CONCEPT_LABELS[conceptKey];
  }
  
  // Fallback: formater la clé
  // Remplacer les tirets par des espaces et mettre en majuscule la première lettre
  return conceptKey
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
