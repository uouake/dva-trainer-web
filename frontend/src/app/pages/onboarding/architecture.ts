import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-architecture',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './architecture.html',
  styleUrl: './architecture.scss',
})
export class ArchitecturePage {
  concepts = [
    { chapter: 'Prologue', awsName: 'AWS / Cloud / Free Tier', storyName: '-', keys: ['aws_cloud', 'free_tier'] },
    { chapter: 'Chapitre 1', awsName: 'Lambda', storyName: 'Robot Cuisinier', keys: ['lambda_execution'] },
    { chapter: 'Chapitre 1', awsName: 'IAM', storyName: "Badges d'Accès", keys: ['iam_roles', 'least_privilege'] },
    { chapter: 'Chapitre 1', awsName: 'API Gateway', storyName: "Porte d'Entrée", keys: ['api_gateway'] },
    { chapter: 'Chapitre 2', awsName: 'S3', storyName: 'Casier Infini', keys: ['s3_buckets', 's3_keys'] },
    { chapter: 'Chapitre 2', awsName: 'DynamoDB', storyName: 'Fiches Élèves', keys: ['dynamodb_keys', 'dynamodb_indexes'] },
    { chapter: 'Chapitre 3', awsName: 'Secrets Manager', storyName: 'Coffre-Fort Numérique', keys: ['secrets_manager'] },
    { chapter: 'Chapitre 3', awsName: 'API Keys', storyName: "Clés d'accès", keys: ['api_keys', 'credentials'] },
    { chapter: 'Chapitre 4', awsName: 'SQS', storyName: 'Boîte aux Lettres', keys: ['sqs_queue', 'sqs_dlq'] },
    { chapter: 'Chapitre 4', awsName: 'SNS', storyName: 'Haut-Parleur', keys: ['sns_topic'] },
    { chapter: 'Chapitre 5', awsName: 'CloudWatch', storyName: 'Tableau de Bord', keys: ['cloudwatch_logs', 'cloudwatch_alarms'] },
    { chapter: 'Chapitre 5', awsName: 'Auto Scaling', storyName: "Armée de Robots", keys: ['autoscaling'] },
    { chapter: 'Chapitre 5', awsName: 'DDOS Protection', storyName: 'Défense contre K', keys: ['aws_security'] },
  ];
}
