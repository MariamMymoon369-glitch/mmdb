export class MovieResponseDto {
  uuid: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  rating: number;
  reviewCount: number;
}

export class PaginatedMoviesResponseDto {
  data: MovieResponseDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
