import { MovieResponseDto } from '../../movies/dto/movie-response.dto';
import { PersonSummaryDto } from '../../movies/dto/movie-details.dto';

export class SearchResponseDto {
  query: string;
  movies: MovieResponseDto[];
  people: PersonSummaryDto[];
}
