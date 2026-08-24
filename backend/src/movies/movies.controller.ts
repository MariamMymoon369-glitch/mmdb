import { Controller, Get, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  getMovies(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    return this.moviesService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 8,
      sort: sort === 'oldest' ? 'oldest' : 'newest',
    });
  }
}
