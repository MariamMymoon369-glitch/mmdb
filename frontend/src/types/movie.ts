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
 