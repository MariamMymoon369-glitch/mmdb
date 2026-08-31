import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './movie.entity';

describe('MoviesService', () => {
  let service: MoviesService;

  const mockMovieRepository = {
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
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
      { id: 1, title: 'Barbie', releaseYear: 2023, rating: 7.5 },
      { id: 2, title: 'Oppenheimer', releaseYear: 2023, rating: 8.4 },
    ];

    mockMovieRepository.findAndCount.mockResolvedValue([mockMovies, 2]);

    const result = await service.findAll({});

    expect(result).toEqual({
      data: mockMovies,
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

    await service.findAll({ page: 2, limit: 5, sort: 'oldest' });

    expect(mockMovieRepository.findAndCount).toHaveBeenCalledWith({
      order: { releaseYear: 'ASC', id: 'ASC' },
      skip: 5,
      take: 5,
    });
  });
});
