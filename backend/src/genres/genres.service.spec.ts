import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Genre } from './genre.entity';
import { GenresService } from './genres.service';

describe('GenresService', () => {
  let service: GenresService;

  const mockGenreRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: getRepositoryToken(Genre), useValue: mockGenreRepository },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns every genre ordered by name', async () => {
    mockGenreRepository.find.mockResolvedValue([
      { id: 2, name: 'Drama' },
      { id: 1, name: 'Comedy' },
    ]);

    const result = await service.findAll();

    expect(mockGenreRepository.find).toHaveBeenCalledWith({
      order: { name: 'ASC' },
    });
    expect(result).toEqual([
      { id: 2, name: 'Drama' },
      { id: 1, name: 'Comedy' },
    ]);
  });

  it('returns an empty list when there are no genres', async () => {
    mockGenreRepository.find.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual([]);
  });
});
