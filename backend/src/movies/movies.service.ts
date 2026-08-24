import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';

type MovieSort = 'oldest' | 'newest';

interface FindMoviesOptions {
  page?: number;
  limit?: number;
  sort?: MovieSort;
}

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async findAll(options: FindMoviesOptions | null = {}) {
    const { page = 1, limit = 10, sort = 'newest' } = options ?? {};
    const query = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoin('reviews', 'review', 'review.movie_id = movie.id')
      .select([
        'movie.id',
        'movie.uuid',
        'movie.title',
        'movie.releaseYear',
        'movie.posterUrl',
      ])
      .addSelect('COALESCE(AVG(review.rating), 0)', 'rating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .groupBy('movie.id');

    query.orderBy('movie.releaseYear', sort === 'oldest' ? 'ASC' : 'DESC');

    const safePage = Number.isFinite(page) ? Math.max(1, page) : 1;
    const safeLimit = Number.isFinite(limit) ? Math.max(1, limit) : 10;
    query.skip((safePage - 1) * safeLimit).take(safeLimit);

    const [entities, total] = await query.getManyAndCount();

    return {
      data: entities,
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    };
  }
}
