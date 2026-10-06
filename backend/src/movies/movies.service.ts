import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Movie } from './movie.entity';
import { GetMoviesDto, MovieSortOption } from './dto/get-movies.dto';
import { PaginatedMoviesResponseDto } from './dto/movie-response.dto';
import { CreateMovieDto } from './dto/CreateMovie.dto';
import {
  MovieDetailsResponseDto,
  PersonSummaryDto,
} from './dto/movie-details.dto';
import { RateMovieDto } from './dto/rate-movie.dto';
import { Review } from '../reviews/review.entity';
import { User } from '../users/user.entity';
import { AuthService } from '../auth/auth.service';

const WRITER_JOBS = ['Writer', 'Screenplay', 'Story'];

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
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
  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const newMovie = this.movieRepository.create(createMovieDto);
    return await this.movieRepository.save(newMovie);
  }

  async findByUuid(
    uuid: string,
    authorization?: string,
  ): Promise<MovieDetailsResponseDto> {
    const movie = await this.movieRepository.findOne({
      where: { uuid },
      relations: {
        cast: { person: true },
        crew: { person: true },
        genres: { genre: true },
      },
    });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    const userId = await this.resolveUserId(authorization);
    let myRating: number | null = null;
    if (userId !== null) {
      const existing = await this.reviewRepository.findOne({
        where: { movie: { id: movie.id }, user: { id: userId } },
      });
      myRating = existing?.rating ?? null;
    }

    const toPersonSummary = (person: {
      uuid: string;
      name: string;
      photoUrl: string | null;
    }): PersonSummaryDto => ({
      uuid: person.uuid,
      name: person.name,
      photoUrl: person.photoUrl,
    });

    const directors = new Map<string, PersonSummaryDto>();
    const writers = new Map<string, PersonSummaryDto>();
    for (const crew of movie.crew ?? []) {
      if (crew.job === 'Director') {
        directors.set(crew.person.uuid, toPersonSummary(crew.person));
      } else if (WRITER_JOBS.includes(crew.job)) {
        writers.set(crew.person.uuid, toPersonSummary(crew.person));
      }
    }

    const cast = [...(movie.cast ?? [])]
      .sort((a, b) => (a.billingOrder ?? 0) - (b.billingOrder ?? 0))
      .map((c) => ({
        uuid: c.person.uuid,
        name: c.person.name,
        photoUrl: c.person.photoUrl,
        characterName: c.characterName,
      }));

    return {
      uuid: movie.uuid,
      title: movie.title,
      releaseYear: movie.releaseYear,
      runtimeMinutes: movie.runtimeMinutes,
      overview: movie.overview,
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl,
      language: movie.language,
      rating: movie.rating,
      reviewCount: movie.reviewCount,
      genres: (movie.genres ?? []).map((g) => g.genre.name),
      directors: [...directors.values()],
      writers: [...writers.values()],
      cast,
      myRating,
    };
  }

  async rate(
    uuid: string,
    userId: number,
    rateMovieDto: RateMovieDto,
  ): Promise<{ rating: number | null }> {
    const movie = await this.movieRepository.findOne({ where: { uuid } });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    let review = await this.reviewRepository.findOne({
      where: { movie: { id: movie.id }, user: { id: userId } },
    });
    if (review) {
      review.rating = rateMovieDto.rating;
    } else {
      review = this.reviewRepository.create({
        movie,
        user: { id: userId } as User,
        rating: rateMovieDto.rating,
        title: null,
        body: null,
      });
    }
    await this.reviewRepository.save(review);
    await this.refreshMovieAggregates(movie.id);
    return { rating: review.rating };
  }

  async getMyRating(
    uuid: string,
    userId: number,
  ): Promise<{ rating: number | null }> {
    const movie = await this.movieRepository.findOne({ where: { uuid } });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    const review = await this.reviewRepository.findOne({
      where: { movie: { id: movie.id }, user: { id: userId } },
    });
    return { rating: review?.rating ?? null };
  }

  async refreshMovieAggregates(movieId: number): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: { movie: { id: movieId } },
    });
    const rated = reviews.filter((r) => r.rating != null);
    const written = reviews.filter((r) => r.body != null);
    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
    });
    if (!movie) {
      return;
    }
    movie.reviewCount = written.length;
    movie.rating =
      rated.length > 0
        ? Number(
            (
              rated.reduce((sum, r) => sum + (r.rating as number), 0) /
              rated.length
            ).toFixed(1),
          )
        : 0;
    await this.movieRepository.save(movie);
  }

  private async resolveUserId(authorization?: string): Promise<number | null> {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }
    try {
      const payload = this.jwtService.verify<{ sub: number | string; jti?: string }>(
        authorization.slice('Bearer '.length),
      );
      if (payload.jti && (await this.authService.isRevoked(payload.jti))) {
        return null;
      }
      return Number(payload.sub);
    } catch {
      return null;
    }
  }
}
