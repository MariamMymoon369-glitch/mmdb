import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { GetMoviesDto, MovieSortOption } from './dto/get-movies.dto';
import { PaginatedMoviesResponseDto } from './dto/movie-response.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async findAll(queryDto: GetMoviesDto): Promise<PaginatedMoviesResponseDto> {
    const { page = 1, limit = 8, sort = 'newest' } = queryDto;

    const orderDirection = sort === MovieSortOption.OLDEST ? 'ASC' : 'DESC';

    const [data, total] = await this.movieRepository.findAndCount({
      order: {
        releaseYear: orderDirection,
        id: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map((movie) => ({
        uuid: movie.uuid,
        title: movie.title,
        releaseYear: movie.releaseYear,
        posterUrl: movie.posterUrl,
        rating: movie.rating,
        reviewCount: movie.reviewCount,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
