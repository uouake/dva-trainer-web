import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Entry point of the NestJS application.
//
// We load `.env` (via dotenv/config) so developers can run the app locally
// without exporting env vars manually.

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so the Angular frontend (localhost:4200) can call the API.
  // For MVP we keep it permissive; we will tighten it later.
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
}

bootstrap();
