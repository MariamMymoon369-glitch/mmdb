export interface Movie {
  uuid: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  rating: number;      
  reviewCount: number; 
}

export interface PaginatedMovies {
  data: Movie[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PersonSummary {
  uuid: string;
  name: string;
  photoUrl: string | null;
}

export interface CastMember {
  uuid: string;
  name: string;
  photoUrl: string | null;
  characterName: string;
}

export interface MovieDetails {
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
  directors: PersonSummary[];
  writers: PersonSummary[];
  cast: CastMember[];
  myRating: number | null;
}

export interface ReviewItem {
  uuid: string;
  title: string | null;
  body: string | null;
  rating: number | null;
  createdAt: string;
  userUuid: string;
  reviewer: {
    displayName: string;
    profilePictureUrl: string | null;
  };
}

export interface PaginatedReviews {
  data: ReviewItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Person {
  id: number;
  uuid: string;
  tmdbId: number | null;
  name: string;
  photoUrl: string | null;
  biography: string | null;
  gender: string | null;
  birthdate: string | null;
  placeOfBirth: string | null;
  knownFor: string | null;
}
