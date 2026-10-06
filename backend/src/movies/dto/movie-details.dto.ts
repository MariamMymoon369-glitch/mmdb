export class PersonSummaryDto {
  uuid: string;
  name: string;
  photoUrl: string | null;
}

export class CastMemberDto {
  uuid: string;
  name: string;
  photoUrl: string | null;
  characterName: string;
}

export class MovieDetailsResponseDto {
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
  genres: string[];
  directors: PersonSummaryDto[];
  writers: PersonSummaryDto[];
  cast: CastMemberDto[];
  myRating: number | null;
}
