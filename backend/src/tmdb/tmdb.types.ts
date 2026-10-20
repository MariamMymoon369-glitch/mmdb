export interface TmdbPersonDetail {
  id: number;
  name: string;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  place_of_birth: string | null;
  known_for_department: string | null;
  profile_path: string | null;
  imdb_id: string | null;
  popularity: number;
}

export interface TmdbMovieCredit {
  id: number;
  title: string;
  release_date: string | null;
  character: string;
  poster_path: string | null;
  order: number;
  credit_id: string;
}

export interface TmdbMovieCreditsResponse {
  id: number;
  cast: TmdbMovieCredit[];
}

export interface TmdbMovieSummary {
  id: number;
  title: string;
  release_date: string | null;
  poster_path: string | null;
}
