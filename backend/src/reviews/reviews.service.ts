import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Review } from './review.entity';
import { Movie } from '../movies/movie.entity';
import { User } from '../users/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import {
  PaginatedReviewsResponseDto,
  ReviewResponseDto,
} from './dto/review-response.dto';
import { MoviesService } from '../movies/movies.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly moviesService: MoviesService,
  ) {}

  async create(
    movieUuid: string,
    userId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<{ uuid: string }> {
    const movie = await this.movieRepository.findOne({
      where: { uuid: movieUuid },
    });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    let review = await this.reviewRepository.findOne({
      where: { movie: { id: movie.id }, user: { id: userId } },
    });

    if (review && review.body != null) {
      throw new ConflictException('You have already reviewed this movie');
    }

    if (!review) {
      review = this.reviewRepository.create({
        movie,
        user: { id: userId } as User,
        rating: createReviewDto.rating ?? null,
        title: createReviewDto.title,
        body: createReviewDto.body,
      });
    } else {
      review.title = createReviewDto.title;
      review.body = createReviewDto.body;
      if (createReviewDto.rating !== undefined) {
        review.rating = createReviewDto.rating;
      }
    }

    const saved = await this.reviewRepository.save(review);
    await this.moviesService.refreshMovieAggregates(movie.id);
    return { uuid: saved.uuid };
  }

  async findAllForMovie(
    movieUuid: string,
    queryDto: GetReviewsDto,
  ): Promise<PaginatedReviewsResponseDto> {
    const { page = 1, limit = 5 } = queryDto;

    const movie = await this.movieRepository.findOne({
      where: { uuid: movieUuid },
    });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    const [data, total] = await this.reviewRepository.findAndCount({
      where: { movie: { id: movie.id }, body: Not(IsNull()) },
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: data.map((review): ReviewResponseDto => ({
        uuid: review.uuid,
        title: review.title,
        body: review.body,
        rating: review.rating,
        createdAt: review.createdAt,
        userUuid: review.user.uuid,
        reviewer: {
          displayName: review.user.displayName,
          profilePictureUrl: review.user.profilePictureUrl,
        },
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
