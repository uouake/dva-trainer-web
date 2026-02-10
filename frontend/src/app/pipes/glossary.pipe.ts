import { Pipe, PipeTransform } from '@angular/core';
import { GlossaryService } from '../core/glossary.service';

@Pipe({
  name: 'glossary',
  standalone: true
})
export class GlossaryPipe implements PipeTransform {
  private readonly awsTerms = [
    'IAM', 'Lambda', 'VPC', 'S3', 'EC2', 'DynamoDB', 'SQS', 'SNS', 
    'CloudFront', 'CloudWatch', 'CloudTrail', 'Route 53', 'ELB', 
    'Auto Scaling', 'RDS', 'ElastiCache', 'Step Functions', 'EventBridge',
    'Secrets Manager', 'Systems Manager', 'CodePipeline', 'CodeBuild',
    'CodeDeploy', 'CodeCommit', 'Cognito', 'SES', 'WAF', 'Kinesis',
    'ECS', 'DAX', 'GSI', 'LSI', 'ARN', 'AZ', 'ENI', 'NACL',
    'Security Group', 'Subnet', 'TTL', 'EBS', 'AMI', 'CRUD', 'API',
    'Serverless', 'AppConfig', 'AppSync', 'Lambda@Edge', 'Athena', 'SAM'
  ];
  
  constructor(private glossaryService: GlossaryService) {}
  
  transform(value: string): string {
    if (!value) return '';
    
    let result = value;
    
    // Détecter si le contenu est déjà du HTML (contient des balises HTML courantes)
    const hasHtmlTags = /<\/?(?:p|strong|em|ul|ol|li|h[1-6]|br|span|div)[^>]*>/i.test(value);
    
    // N'échapper le HTML que si ce n'est pas déjà du HTML formaté
    if (!hasHtmlTags) {
      result = this.escapeHtml(result);
    }
    
    // Trier par longueur décroissante pour éviter les remplacements partiels
    const sortedTerms = [...this.awsTerms].sort((a, b) => b.length - a.length);
    
    for (const term of sortedTerms) {
      const glossaryTerm = this.glossaryService.getTerm(term);
      if (!glossaryTerm) continue;
      
      // Créer un regex qui match le terme entier (word boundary)
      const regex = new RegExp(`\\b(${this.escapeRegex(term)})\\b`, 'gi');
      
      // Remplacer par un span avec classe et attributs data
      result = result.replace(regex, (match) => {
        return `<span class="glossary-term-inline" data-term="${term}" title="${this.escapeHtml(glossaryTerm.analogy)}">${match}</span>`;
      });
    }
    
    return result;
  }
  
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
