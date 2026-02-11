import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { FlashcardsPage } from './flashcards';
import { FlashcardsService, Flashcard, FlashcardStats } from './flashcards.service';
import { environment } from '../../../environments/environment';

describe('FlashcardsPage', () => {
  let component: FlashcardsPage;
  let fixture: ComponentFixture<FlashcardsPage>;
  let httpMock: HttpTestingController;

  const mockFlashcards: Flashcard[] = [
    {
      id: '1',
      question: 'Qu\'est-ce que AWS Lambda ?',
      answer: 'Un service de calcul serverless qui exécute du code en réponse à des événements.',
      category: 'Compute',
      difficulty: 'easy',
      tags: ['serverless', 'FaaS'],
    },
    {
      id: '2',
      question: 'Quelle est la différence entre S3 Standard et S3 Glacier ?',
      answer: 'S3 Standard est pour l\'accès fréquent, Glacier est pour l\'archivage à long terme.',
      category: 'Storage',
      difficulty: 'medium',
      tags: ['S3', 'storage', 'archive'],
    },
    {
      id: '3',
      question: 'Expliquez le modèle de responsabilité partagée AWS.',
      answer: 'AWS gère la sécurité DU cloud, le client gère la sécurité DANS le cloud.',
      category: 'Security',
      difficulty: 'hard',
      tags: ['security', 'compliance'],
    },
  ];

  const mockStats: FlashcardStats = {
    totalFlashcards: 100,
    reviewedFlashcards: 45,
    knownFlashcards: 30,
    toReviewFlashcards: 15,
    progressPercentage: 45,
    streakDays: 5,
    lastStudyDate: new Date(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashcardsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FlashcardsPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Initialisation', () => {
    it('devrait créer le composant', () => {
      expect(component).toBeTruthy();
    });

    it('devrait charger les flashcards au démarrage', fakeAsync(() => {
      fixture.detectChanges();

      // Vérifier la requête pour les flashcards aléatoires
      const flashcardsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/random?count=10`);
      expect(flashcardsReq.request.method).toBe('GET');
      flashcardsReq.flush(mockFlashcards);

      // Vérifier la requête pour les stats
      const statsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/stats`);
      expect(statsReq.request.method).toBe('GET');
      statsReq.flush(mockStats);

      tick();
      fixture.detectChanges();

      expect(component.flashcards()).toEqual(mockFlashcards);
      expect(component.stats()).toEqual(mockStats);
      expect(component.state()).toBe('study');
    }));

    it('devrait afficher l\'état vide si aucune flashcard', fakeAsync(() => {
      fixture.detectChanges();

      const flashcardsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/random?count=10`);
      flashcardsReq.flush([]);

      const statsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/stats`);
      statsReq.flush(mockStats);

      tick();
      fixture.detectChanges();

      expect(component.state()).toBe('empty');
    }));

    it('devrait afficher l\'état erreur en cas d\'échec', fakeAsync(() => {
      fixture.detectChanges();

      const flashcardsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/random?count=10`);
      flashcardsReq.flush('Error', { status: 500, statusText: 'Server Error' });

      tick();
      fixture.detectChanges();

      expect(component.state()).toBe('error');
      expect(component.errorMessage()).toBeTruthy();
    }));
  });

  describe('Navigation entre cartes', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();

      const flashcardsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/random?count=10`);
      flashcardsReq.flush(mockFlashcards);

      const statsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/stats`);
      statsReq.flush(mockStats);

      tick();
      fixture.detectChanges();
    }));

    it('devrait afficher la première flashcard au démarrage', () => {
      expect(component.currentIndex()).toBe(0);
      expect(component.currentFlashcard()?.id).toBe('1');
      expect(component.flipState()).toBe('front');
    });

    it('devrait passer à la carte suivante avec nextCard()', () => {
      component.nextCard();
      expect(component.currentIndex()).toBe(1);
      expect(component.currentFlashcard()?.id).toBe('2');
    });

    it('devrait revenir à la carte précédente avec previousCard()', () => {
      component.nextCard();
      component.previousCard();
      expect(component.currentIndex()).toBe(0);
      expect(component.currentFlashcard()?.id).toBe('1');
    });

    it('ne devrait pas pouvoir aller avant la première carte', () => {
      component.previousCard();
      expect(component.currentIndex()).toBe(0);
    });

    it('devrait afficher le résumé après la dernière carte', () => {
      // Naviguer jusqu'à la dernière carte
      component.nextCard();
      component.nextCard();

      // La dernière action next devrait afficher le résumé
      expect(component.state()).toBe('summary');
    });

    it('devrait réinitialiser le flip state lors du changement de carte', () => {
      component.flipCard();
      expect(component.flipState()).toBe('back');

      component.nextCard();
      expect(component.flipState()).toBe('front');
    });
  });

  describe('Animation Flip', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();

      const flashcardsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/random?count=10`);
      flashcardsReq.flush(mockFlashcards);

      const statsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/stats`);
      statsReq.flush(mockStats);

      tick();
      fixture.detectChanges();
    }));

    it('devrait basculer entre front et back avec flipCard()', () => {
      expect(component.flipState()).toBe('front');

      component.flipCard();
      expect(component.flipState()).toBe('back');

      component.flipCard();
      expect(component.flipState()).toBe('front');
    });

    it('devrait avoir canFlip à true en mode study', () => {
      expect(component.canFlip()).toBe(true);
    });

    it('ne devrait pas pouvoir flip si pas en mode study', () => {
      component.state.set('summary');
      expect(component.canFlip()).toBe(false);
    });
  });

  describe('Sauvegarde progression', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();

      const flashcardsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/random?count=10`);
      flashcardsReq.flush(mockFlashcards);

      const statsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/stats`);
      statsReq.flush(mockStats);

      tick();
      fixture.detectChanges();
    }));

    it('devrait sauvegarder quand marqué comme connu', fakeAsync(() => {
      component.flipCard(); // Retourner la carte
      component.markAsKnown();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/progress`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        flashcardId: '1',
        known: true,
      });
      req.flush({});

      tick();
    }));

    it('devrait sauvegarder quand marqué pour révision', fakeAsync(() => {
      component.flipCard();
      component.markForReview();

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/progress`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        flashcardId: '1',
        known: false,
      });
      req.flush({});

      tick();
    }));

    it('devrait mettre à jour les résultats de session', () => {
      component.flipCard();
      component.markAsKnown();

      expect(component.sessionResults().known).toBe(1);
      expect(component.sessionResults().review).toBe(0);
    });

    it('devrait calculer correctement le taux de réussite', () => {
      // Simuler une session: 2 connues, 1 à réviser
      component.sessionResults.set({ known: 2, review: 1 });
      expect(component.getSuccessRate()).toBe(67);
    });
  });

  describe('Progression', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();

      const flashcardsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/random?count=10`);
      flashcardsReq.flush(mockFlashcards);

      const statsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/stats`);
      statsReq.flush(mockStats);

      tick();
      fixture.detectChanges();
    }));

    it('devrait calculer correctement le pourcentage de progression', () => {
      expect(component.progressPercentage()).toBe((1 / 3) * 100);

      component.nextCard();
      expect(component.progressPercentage()).toBe((2 / 3) * 100);
    });

    it('devrait afficher le texte de progression correct', () => {
      expect(component.progressText()).toBe('1 / 3');

      component.nextCard();
      expect(component.progressText()).toBe('2 / 3');
    });

    it('devrait détecter la dernière carte', () => {
      expect(component.isLastCard()).toBe(false);

      component.nextCard();
      expect(component.isLastCard()).toBe(false);

      component.nextCard();
      expect(component.isLastCard()).toBe(true);
    });
  });

  describe('Helpers', () => {
    it('devrait retourner les labels de difficulté corrects', () => {
      expect(component.getDifficultyLabel('easy')).toBe('Facile');
      expect(component.getDifficultyLabel('medium')).toBe('Moyen');
      expect(component.getDifficultyLabel('hard')).toBe('Difficile');
      expect(component.getDifficultyLabel('unknown')).toBe('Inconnu');
    });

    it('devrait retourner les classes de difficulté correctes', () => {
      expect(component.getDifficultyColor('easy')).toBe('easy');
      expect(component.getDifficultyColor('medium')).toBe('medium');
      expect(component.getDifficultyColor('hard')).toBe('hard');
      expect(component.getDifficultyColor('unknown')).toBe('');
    });
  });

  describe('Nouvelle session', () => {
    it('devrait réinitialiser et charger une nouvelle session', fakeAsync(() => {
      fixture.detectChanges();

      // Première charge
      let flashcardsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/random?count=10`);
      flashcardsReq.flush(mockFlashcards);

      let statsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/stats`);
      statsReq.flush(mockStats);

      tick();
      fixture.detectChanges();

      // Naviguer un peu
      component.nextCard();
      component.flipCard();

      // Démarrer nouvelle session
      component.startNewSession();

      // Nouvelle charge
      flashcardsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/random?count=10`);
      flashcardsReq.flush(mockFlashcards);

      statsReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/flashcards/stats`);
      statsReq.flush(mockStats);

      tick();
      fixture.detectChanges();

      // Vérifier réinitialisation
      expect(component.currentIndex()).toBe(0);
      expect(component.flipState()).toBe('front');
      expect(component.sessionResults()).toEqual({ known: 0, review: 0 });
    }));
  });
});
