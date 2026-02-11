import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ChaptersSeeder } from '../onboarding/chapters.seeder';

// seed-chapters.ts
//
// Script pour insérer les chapitres de l'histoire manga dans la base de données.
// Usage: npx ts-node src/scripts/seed-chapters.ts

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(ChaptersSeeder);

  try {
    await seeder.seed();
    console.log('✅ Chapters seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed chapters:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
