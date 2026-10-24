export class CreatedMovieResponseDto {
  uuid: string;
  title: string;
  releaseYear: number;
  runtimeMinutes: number | null;
  overview: string | null;
  posterUrl: string | null;
  trailerUrl: string | null;
  language: string | null;
  rating: number;
  reviewCount: number;
}
