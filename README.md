# DVA Trainer - AWS Developer Associate Certification Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Test Coverage](https://img.shields.io/badge/coverage-86%25-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Angular](https://img.shields.io/badge/Angular-17+-DD0031?logo=angular&logoColor=white)]()
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)]()

> Master AWS Developer Associate certification with interactive practice questions, gamified manga onboarding, and spaced repetition flashcards.

<p align="center">
  <a href="https://dva-trainer-web.onrender.com" target="_blank">
    🌐 Live Demo: dva-trainer-web.onrender.com
  </a>
</p>

---

## 📸 Overview

DVA Trainer is a comprehensive learning platform designed to help developers prepare for the **AWS Developer Associate (DVA-C02)** certification exam. Built with modern web technologies and cloud-native architecture principles.

### Key Features

- 📚 **557 Practice Questions** - Covering all exam domains with detailed explanations
- 🎮 **Gamified Learning** - Manga-style story onboarding (13 chapters across 2 seasons)
- 🃏 **Spaced Repetition Flashcards** - 30 flashcards with metaphors tied to the story
- 📝 **Exam Simulator** - 65-question timed assessments (130 minutes)
- 📅 **Daily Training Routines** - 5/10/15 question daily sessions
- 🔐 **Secure Authentication** - GitHub OAuth 2.0 + JWT implementation
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ♿ **Accessible** - WCAG 2.1 AA compliant

### Screenshots

<table>
  <tr>
    <td align="center">
      <img src="screenshots/dashboard.png" alt="Dashboard" width="400"/>
      <br/>
      <em>User Dashboard with progress tracking</em>
    </td>
    <td align="center">
      <img src="screenshots/questions.png" alt="Questions" width="400"/>
      <br/>
      <em>AWS's glossary</em>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="screenshots/flashcards.png" alt="Flashcards" width="400"/>
      <br/>
      <em>Manga-style onboarding story</em>
    </td>
    <td align="center">
      <img src="screenshots/onboarding.png" alt="Onboarding" width="400"/>
      <br/>
      <em>Spaced repetition flashcards</em>
    </td>
  </tr>
</table>

---

## 🏗️ Architecture

### Backend (NestJS + TypeScript)

```
src/
├── auth/                 # OAuth2/JWT authentication
├── questions/            # Question management & filtering
├── flashcards/           # Spaced repetition system
├── onboarding/           # Manga story content
├── users/                # User management & progress
├── exam-simulator/       # Timed exam sessions
├── database/             # TypeORM entities & migrations
└── config/               # Environment configuration
```

**Key Backend Features:**
- **Authentication:** OAuth2 with GitHub, JWT token management
- **Database:** PostgreSQL with TypeORM
- **Testing:** Jest with 86% code coverage
- **API:** RESTful with OpenAPI/Swagger documentation
- **Security:** Helmet, CORS, input validation

### Frontend (Angular 17+ Standalone)

```
src/
├── app/
│   ├── auth/             # Login & authentication flows
│   ├── dashboard/        # User progress & KPIs
│   ├── questions/        # Practice question interface
│   ├── flashcards/       # Flashcard learning system
│   ├── onboarding/       # Manga story experience
│   ├── exam-simulator/   # Full exam simulation
│   └── shared/           # Components, services, models
├── assets/               # Images, manga illustrations
└── styles/               # SCSS variables & themes
```

**Key Frontend Features:**
- **Standalone Components** - Modern Angular architecture
- **State Management** - RxJS for reactive state
- **Theming** - Dark/Light/Auto mode support
- **Performance** - Lazy loading, code splitting
- **Testing** - Karma & Jasmine unit tests

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- GitHub OAuth App credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/uouake/dva-trainer-web.git
cd dva-trainer-web

# Backend setup
cd backend
cp .env.example .env
# Edit .env with your database credentials and GitHub OAuth keys
npm install
npm run migration:run
npm run start:dev

# Frontend setup (new terminal)
cd ../frontend
npm install
ng serve
```

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dva_trainer
JWT_SECRET=your-secret-key
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
PORT=3000
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test              # Unit tests
npm run test:coverage     # Coverage report
npm run test:e2e          # End-to-end tests
```

### Frontend Tests
```bash
cd frontend
ng test                   # Unit tests with Karma
ng test --coverage        # Coverage report
```

---

## 📊 Project Stats

- **Lines of Code:** ~25,000
- **Test Coverage:** 86% (backend)
- **API Endpoints:** 40+
- **Database Tables:** 15
- **Deployment:** Render (Web Service + PostgreSQL)

---

## 🛣️ Roadmap

- [x] Core question database (557 questions)
- [x] OAuth2/JWT authentication
- [x] Exam simulator
- [x] Flashcards system
- [x] Manga onboarding (Seasons 1 & 2)
- [x] Production deployment
- [ ] Seasons 3+ of onboarding story
- [ ] Competition mode between users
- [ ] Achievement badges system
- [ ] Progress export functionality
- [ ] Email reminder notifications

---

## 🎓 Lessons Learned

### Technical
- **OAuth2 Implementation:** Deep understanding of authorization code flow with GitHub
- **Database Design:** Optimized schema for spaced repetition algorithms
- **CI/CD:** Automated testing and deployment pipelines on Render
- **Performance:** Lazy loading strategies for large question datasets

### Architecture
- **Microservices readiness:** Designed with future service extraction in mind
- **Multi-tenancy considerations:** User isolation and data security patterns
- **Scalability:** Stateless backend design for horizontal scaling

---

## 🛡️ Security

- JWT tokens with secure httpOnly cookies
- Input validation and sanitization
- SQL injection protection via TypeORM
- XSS protection with Angular's built-in sanitization
- Rate limiting on authentication endpoints

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- AWS certification materials and practice questions
- NestJS and Angular communities
- Render for free hosting tier
- All contributors and beta testers

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/uouake">Uriel Ouake</a>
</p>
