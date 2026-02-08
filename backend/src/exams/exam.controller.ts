import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionEntity } from '../infrastructure/db/typeorm.entities';

// Distribution officielle DVA-C02 (65 questions):
// - Development: 32% (21 questions)
// - Security: 26% (17 questions)
// - Deployment: 24% (16 questions)
// - Troubleshooting: 18% (11 questions)

const DVA_C02_DISTRIBUTION = {
  development: 21,
  security: 17,
  deployment: 16,
  troubleshooting: 11,
} as const;

type DomainKey = keyof typeof DVA_C02_DISTRIBUTION;

class StartExamDto {
  count?: number;
  strict?: boolean; // Si true, force l'exacte distribution; sinon, complète si manque de questions
}

@Controller('api/exams')
export class ExamController {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionsRepo: Repository<QuestionEntity>,
  ) {}

  @Post('start')
  async start(@Body() body: StartExamDto) {
    const requestedCount = Math.max(1, Math.min(body.count ?? 65, 65));
    const strict = body.strict ?? false;

    // Récupérer toutes les questions actives par domaine
    const questionsByDomain = await this.getQuestionsByDomain();

    // Sélectionner les questions selon la distribution officielle
    const selectedQuestions = this.selectQuestionsWithDistribution(
      questionsByDomain,
      strict,
    );

    // Mélanger l'ordre des questions pour l'examen
    const shuffled = this.shuffleArray(selectedQuestions);

    // Vérifier qu'on a bien 65 questions (ou moins si pas assez en DB)
    if (shuffled.length < 65) {
      console.warn(
        `[Exam] Warning: Only ${shuffled.length} questions available instead of 65`,
      );
    }

    return {
      mode: 'exam',
      count: shuffled.length,
      durationMinutes: 130,
      items: shuffled,
      distribution: this.calculateDistribution(shuffled),
    };
  }

  private async getQuestionsByDomain(): Promise<Record<DomainKey | 'unknown', QuestionEntity[]>> {
    const allQuestions = await this.questionsRepo.find({
      where: { isActive: true },
    });

    const byDomain: Record<string, QuestionEntity[]> = {
      development: [],
      security: [],
      deployment: [],
      troubleshooting: [],
      unknown: [],
    };

    for (const q of allQuestions) {
      const domain = (q.domainKey ?? 'unknown') as DomainKey | 'unknown';
      if (!byDomain[domain]) {
        byDomain[domain] = [];
      }
      byDomain[domain].push(q);
    }

    return byDomain;
  }

  private selectQuestionsWithDistribution(
    questionsByDomain: Record<string, QuestionEntity[]>,
    strict: boolean,
  ): QuestionEntity[] {
    const selected: QuestionEntity[] = [];
    const domains: DomainKey[] = ['development', 'security', 'deployment', 'troubleshooting'];

    // Sélectionner selon la distribution officielle
    for (const domain of domains) {
      const needed = DVA_C02_DISTRIBUTION[domain];
      const available = questionsByDomain[domain] ?? [];

      if (available.length < needed) {
        if (strict) {
          throw new BadRequestException(
            `Not enough questions in domain '${domain}': ${available.length} available, ${needed} required`,
          );
        }
        // Prendre toutes les questions disponibles
        selected.push(...this.shuffleArray(available));
        console.warn(
          `[Exam] Warning: Domain '${domain}' has only ${available.length}/${needed} questions`,
        );
      } else {
        // Sélectionner aléatoirement le nombre requis
        const shuffled = this.shuffleArray([...available]);
        selected.push(...shuffled.slice(0, needed));
      }
    }

    // Si on n'a pas assez de questions (mode non-strict), compléter avec d'autres domaines
    const totalNeeded = 65;
    if (!strict && selected.length < totalNeeded) {
      const remaining = totalNeeded - selected.length;
      const alreadySelectedIds = new Set(selected.map((q) => q.id));

      // Récupérer toutes les questions restantes
      const allRemaining: QuestionEntity[] = [];
      for (const domain of domains) {
        const available = questionsByDomain[domain] ?? [];
        for (const q of available) {
          if (!alreadySelectedIds.has(q.id)) {
            allRemaining.push(q);
          }
        }
      }

      // Ajouter des questions du domaine 'unknown' si nécessaire
      const unknownQuestions = questionsByDomain['unknown'] ?? [];
      allRemaining.push(...unknownQuestions.filter((q) => !alreadySelectedIds.has(q.id)));

      if (allRemaining.length > 0) {
        const additional = this.shuffleArray(allRemaining).slice(0, remaining);
        selected.push(...additional);
      }
    }

    return selected;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private calculateDistribution(questions: QuestionEntity[]): Record<string, number> {
    const dist: Record<string, number> = {};
    for (const q of questions) {
      const domain = q.domainKey ?? 'unknown';
      dist[domain] = (dist[domain] ?? 0) + 1;
    }
    return dist;
  }
}
