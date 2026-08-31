import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { GetMoviesDto } from './dto/get-movies.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  getMovies(
    @Query(new ValidationPipe({ transform: true })) query: GetMoviesDto,
  ) {
    return this.moviesService.findAll(query);
  }
}
