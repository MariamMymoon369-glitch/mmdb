import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TmdbMovieCredit,
  TmdbMovieCreditsResponse,
  TmdbMovieSummary,
  TmdbPersonDetail,
} from './tmdb.types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT_MS = 10_000;

export class TmdbRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TmdbRequestError';
  }
}

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);

  constructor(private readonly configService: ConfigService) {}

  private get apiKey(): string | undefined {
    return this.configService.get<string>('TMDB_API_KEY');
  }

  private get readToken(): string | undefined {
    return this.configService.get<string>('TMDB_READ_TOKEN');
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey || this.readToken);
  }

  imageUrl(path: string | null | undefined, size = 'w500'): string | null {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  async fetchJson<T>(path: string): Promise<T> {
    if (!this.isConfigured) {
      throw new TmdbRequestError(
        'TMDB is not configured. Set TMDB_READ_TOKEN (v4) or TMDB_API_KEY (v3) in backend/.env',
      );
    }

    const separator = path.includes('?') ? '&' : '?';
    const url = this.readToken
      ? `${TMDB_BASE}${path}`
      : `${TMDB_BASE}${path}${separator}api_key=${encodeURIComponent(this.apiKey as string)}`;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          accept: 'application/json',
          ...(this.readToken
            ? { Authorization: `Bearer ${this.readToken}` }
            : {}),
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      throw new TmdbRequestError(
        `TMDB request failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }

    if (!response.ok) {
      throw new TmdbRequestError(
        `TMDB responded with status ${response.status}`,
      );
    }

    return (await response.json()) as T;
  }

  async getPerson(personId: number): Promise<TmdbPersonDetail> {
    return this.fetchJson<TmdbPersonDetail>(
      `/person/${personId}?language=en-US`,
    );
  }

  async getPersonMovieCredits(personId: number): Promise<TmdbMovieCredit[]> {
    const response = await this.fetchJson<TmdbMovieCreditsResponse>(
      `/person/${personId}/movie_credits?language=en-US`,
    );
    return response.cast ?? [];
  }

  async getMovie(movieId: number): Promise<TmdbMovieSummary> {
    return this.fetchJson<TmdbMovieSummary>(`/movie/${movieId}?language=en-US`);
  }
}
