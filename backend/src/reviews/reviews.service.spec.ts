import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './review.entity';
import { Movie } from '../movies/movie.entity';
import { MoviesService } from '../movies/movies.service';

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

describe('ReviewsService', () => {
  let service: ReviewsService;

  const mockReviewRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn((x) => Promise.resolve({ uuid: 'rev-uuid', ...x })),
  };

  const mockMovieRepository = {
    findOne: jest.fn(),
  };

  const mockMoviesService = {
    refreshMovieAggregates: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create throws NotFoundException for unknown movie', async () => {
    mockMovieRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create('missing', 1, { title: 't', body: 'b' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('create throws ConflictException when user already reviewed', async () => {
    mockMovieRepository.findOne.mockResolvedValue({ id: 1 });
    mockReviewRepository.findOne.mockResolvedValue({ body: 'already' });

    await expect(
      service.create('m1', 1, { title: 't', body: 'b' }),
    ).rejects.toThrow(ConflictException);
  });

  it('create fills title/body on an existing rating-only row', async () => {
    mockMovieRepository.findOne.mockResolvedValue({ id: 1 });
    mockReviewRepository.findOne.mockResolvedValue({ rating: 8, body: null });

    await service.create('m1', 1, { title: 'Great', body: 'Loved it' });

    expect(mockReviewRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Great', body: 'Loved it', rating: 8 }),
    );
    expect(mockMoviesService.refreshMovieAggregates).toHaveBeenCalledWith(1);
  });

  it('create starts a new row when none exists', async () => {
    mockMovieRepository.findOne.mockResolvedValue({ id: 1 });
    mockReviewRepository.findOne.mockResolvedValue(null);

    await service.create('m1', 1, {
      title: 'Nice',
      body: 'Fun',
      rating: 7,
    });

    expect(mockReviewRepository.save).toHaveBeenCalled();
    expect(mockMoviesService.refreshMovieAggregates).toHaveBeenCalledWith(1);
  });

  it('findAllForMovie returns paginated reviews with reviewer info', async () => {
    mockMovieRepository.findOne.mockResolvedValue({ id: 1 });
    mockReviewRepository.findAndCount.mockResolvedValue([
      [
        {
          uuid: 'r1',
          title: 'Good',
          body: 'Yes',
          rating: 9,
          createdAt: new Date('2024-01-01'),
          user: {
            uuid: 'u1',
            displayName: 'amara.o',
            profilePictureUrl: 'pic.jpg',
          },
        },
      ],
      1,
    ]);

    const result = await service.findAllForMovie('m1', {
      page: 1,
      limit: 5,
    });

    expect(result.total).toBe(1);
    expect(result.data[0]).toMatchObject({
      title: 'Good',
      body: 'Yes',
      rating: 9,
      userUuid: 'u1',
      reviewer: { displayName: 'amara.o', profilePictureUrl: 'pic.jpg' },
    });
  });
});
