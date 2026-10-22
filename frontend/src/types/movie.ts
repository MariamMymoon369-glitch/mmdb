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

export interface ActingCredit {
  title: string;
  characterName: string;
  releaseYear: number | null;
  posterUrl: string | null;
  movieUuid: string | null;
}

export interface AwardEntry {
  year: number | null;
  status: string;
  awardName: string;
  awardCategory: string | null;
  associatedMovieTitle: string | null;
  associatedMovieYear: number | null;
  movieUuid: string | null;
  posterUrl: string | null;
}

export interface PersonDetails {
  uuid: string;
  name: string;
  photoUrl: string | null;
  biography: string | null;
  gender: string | null;
  birthdate: string | null;
  deathdate: string | null;
  age: number | null;
  placeOfBirth: string | null;
  knownFor: string | null;
  acting: ActingCredit[];
  awards: AwardEntry[];
}

export interface SearchResults {
  query: string;
  movies: Movie[];
  people: PersonSummary[];
}

export interface Genre {
  id: number;
  name: string;
}
