import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { GetMoviesDto } from './dto/get-movies.dto';

export interface MoviesPaginatedResponse {
  data: Movie[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async findAll(queryDto: GetMoviesDto): Promise<MoviesPaginatedResponse> {
    const { page = 1, limit = 8, sort = 'newest' } = queryDto;

    const orderDirection = sort === 'oldest' ? 'ASC' : 'DESC';

    const [data, total] = await this.movieRepository.findAndCount({
      order: {
        releaseYear: orderDirection,
        id: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
