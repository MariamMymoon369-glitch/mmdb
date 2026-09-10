import { ConfigService } from '@nestjs/config';

export function resolveJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is required - refusing to start with a fallback secret',
    );
  }
  return secret;
}
