import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './movie.entity';
import { Review } from '../reviews/review.entity';
import { MovieSortOption } from './dto/get-movies.dto';
import { AuthService } from '../auth/auth.service';

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

describe('MoviesService', () => {
  let service: MoviesService;

  const mockMovieRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn((x) => Promise.resolve(x)),
  };

  const mockReviewRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn((x) => Promise.resolve(x)),
  };

  const mockAuthService = {
    isRevoked: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated movies with default parameters', async () => {
    const mockMovies = [
      {
        id: 1,
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Barbie',
        releaseYear: 2023,
        rating: 7.5,
        posterUrl: 'https://example.com/barbie.jpg',
        reviewCount: 10,
      },
      {
        id: 2,
        uuid: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Oppenheimer',
        releaseYear: 2023,
        rating: 8.4,
        posterUrl: 'https://example.com/oppenheimer.jpg',
        reviewCount: 15,
      },
    ];

    mockMovieRepository.findAndCount.mockResolvedValue([mockMovies, 2]);

    const result = await service.findAll({
      page: 1,
      limit: 8,
      sort: MovieSortOption.NEWEST,
    });

    expect(result).toEqual({
      data: mockMovies.map(
        ({ uuid, title, releaseYear, posterUrl, rating, reviewCount }) => ({
          uuid,
          title,
          releaseYear,
          posterUrl,
          rating,
          reviewCount,
        }),
      ),
      page: 1,
      limit: 8,
      total: 2,
      totalPages: 1,
    });

    expect(mockMovieRepository.findAndCount).toHaveBeenCalledWith({
      order: { releaseYear: 'DESC', id: 'ASC' },
      skip: 0,
      take: 8,
    });
  });

  it('should handle custom sorting and pagination correctly', async () => {
    mockMovieRepository.findAndCount.mockResolvedValue([[], 50]);

    await service.findAll({ page: 2, limit: 5, sort: MovieSortOption.OLDEST });

    expect(mockMovieRepository.findAndCount).toHaveBeenCalledWith({
      order: { releaseYear: 'ASC', id: 'ASC' },
      skip: 5,
      take: 5,
    });
  });

  it('findByUuid throws NotFoundException for unknown movie', async () => {
    mockMovieRepository.findOne.mockResolvedValue(null);

    await expect(service.findByUuid('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findByUuid returns details with genres, directors, writers and cast', async () => {
    const person = {
      uuid: 'p1',
      name: 'Director A',
      photoUrl: null,
    };
    mockMovieRepository.findOne.mockResolvedValue({
      id: 1,
      uuid: 'm1',
      title: 'Movie',
      releaseYear: 2020,
      runtimeMinutes: 100,
      overview: 'o',
      posterUrl: null,
      trailerUrl: null,
      language: 'English',
      rating: 8,
      reviewCount: 3,
      cast: [
        {
          characterName: 'Hero',
          billingOrder: 0,
          person: { uuid: 'p2', name: 'Actor', photoUrl: null },
        },
      ],
      crew: [{ job: 'Director', person }],
      genres: [{ genre: { name: 'Drama' } }],
    });

    const result = await service.findByUuid('m1');

    expect(result.genres).toEqual(['Drama']);
    expect(result.directors).toEqual([
      { uuid: 'p1', name: 'Director A', photoUrl: null },
    ]);
    expect(result.writers).toEqual([]);
    expect(result.cast).toEqual([
      { uuid: 'p2', name: 'Actor', photoUrl: null, characterName: 'Hero' },
    ]);
    expect(result.myRating).toBeNull();
  });

  it('getMyRating returns null when no rating exists', async () => {
    mockMovieRepository.findOne.mockResolvedValue({ id: 1, uuid: 'm1' });
    mockReviewRepository.findOne.mockResolvedValue(null);

    await expect(service.getMyRating('m1', 1)).resolves.toEqual({
      rating: null,
    });
  });

  it('rate creates a new rating-only review', async () => {
    mockMovieRepository.findOne.mockResolvedValue({ id: 1, uuid: 'm1' });
    mockReviewRepository.findOne.mockResolvedValue(null);
    mockReviewRepository.find.mockResolvedValue([{ rating: 8, body: null }]);

    const result = await service.rate('m1', 1, { rating: 8 });

    expect(mockReviewRepository.save).toHaveBeenCalled();
    expect(result).toEqual({ rating: 8 });
  });

  it('rate updates an existing review instead of duplicating', async () => {
    mockMovieRepository.findOne.mockResolvedValue({ id: 1, uuid: 'm1' });
    mockReviewRepository.findOne.mockResolvedValue({
      id: 5,
      rating: 3,
      body: null,
    });
    mockReviewRepository.find.mockResolvedValue([{ rating: 9, body: null }]);

    const result = await service.rate('m1', 1, { rating: 9 });

    expect(mockReviewRepository.create).not.toHaveBeenCalled();
    expect(result).toEqual({ rating: 9 });
  });

  it('refreshMovieAggregates counts only written reviews for reviewCount', async () => {
    mockReviewRepository.find.mockResolvedValue([
      { rating: 8, body: 'Great' },
      { rating: 10, body: null },
      { rating: null, body: 'Nice' },
    ]);
    mockMovieRepository.findOne.mockResolvedValue({ id: 1, rating: 0, reviewCount: 0 });

    await service.refreshMovieAggregates(1);

    expect(mockMovieRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 9, reviewCount: 2 }),
    );
  });
});
