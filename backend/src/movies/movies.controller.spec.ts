import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { GetMoviesDto, MovieSortOption } from './dto/get-movies.dto';

describe('MoviesController', () => {
  let controller: MoviesController;

  const mockMoviesService = {
    findAll: jest.fn().mockResolvedValue({ data: [], totalPages: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes the default query parameters to the service', async () => {
    const query: GetMoviesDto = {
      page: 1,
      limit: 8,
      sort: MovieSortOption.NEWEST,
    };

    await controller.getMovies(query);

    expect(mockMoviesService.findAll).toHaveBeenCalledWith(query);
  });

  it('passes the customized query parameters to the service', async () => {
    const query: GetMoviesDto = {
      page: 2,
      limit: 12,
      sort: MovieSortOption.OLDEST,
    };

    await controller.getMovies(query);

    expect(mockMoviesService.findAll).toHaveBeenCalledWith(query);
  });
});
