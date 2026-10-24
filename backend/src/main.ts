import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Keep the API's existing asset behavior: the frontend loads TMDB images and
  // Google Fonts directly, so no restrictive CSP is applied here.
  app.use(helmet({ contentSecurityPolicy: false }));

  const configService = app.get(ConfigService);
  const clientUrl =
    configService.get<string>('CLIENT_URL') ?? 'http://localhost:5173';
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({
    origin: clientUrl,
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap().catch((error: unknown) => {
  console.error('Application failed to start', error);
  process.exitCode = 1;
});
