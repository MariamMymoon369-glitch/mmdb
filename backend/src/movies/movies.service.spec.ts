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

interface RawMovieRow {
  movie_id: number;
  rating: string | number | null;
  reviewCount?: string | number;
}

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async findAll(options: FindMoviesOptions | null = {}) {
    const { page = 1, limit = 10, sort = 'newest' } = options ?? {};

    const safePage = Number.isFinite(page) ? Math.max(1, page) : 1;
    const safeLimit = Number.isFinite(limit) ? Math.max(1, limit) : 10;

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
      .groupBy('movie.id')
      .orderBy('movie.releaseYear', sort === 'oldest' ? 'ASC' : 'DESC')
      .offset((safePage - 1) * safeLimit)
      .limit(safeLimit);

    const { entities, raw } = await query.getRawAndEntities();
    const typedRawRows = raw as RawMovieRow[];

    const total = await this.movieRepository.count();

    const data = entities.map((movie) => {
      const rawRow = typedRawRows.find((r) => r.movie_id === movie.id);
      const rawRating = rawRow?.rating ?? 0;

      const numericRating =
        typeof rawRating === 'number'
          ? rawRating
          : parseFloat(String(rawRating));

      return {
        ...movie,
        rating: Number.isNaN(numericRating)
          ? 0
          : parseFloat(numericRating.toFixed(1)),
      };
    });

    return {
      data,
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    };
  }
}
