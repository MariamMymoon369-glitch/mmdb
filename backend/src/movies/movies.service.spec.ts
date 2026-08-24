import { MoviesService } from './movies.service';
import { Movie } from './movie.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';

describe('MoviesService', () => {
  let service: MoviesService;
  let query: jest.Mocked<SelectQueryBuilder<Movie>>;
  let repository: jest.Mocked<Repository<Movie>>;

  beforeEach(() => {
    query = {
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1 } as Movie], 9]),
    } as unknown as jest.Mocked<SelectQueryBuilder<Movie>>;

    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(query),
    } as unknown as jest.Mocked<Repository<Movie>>;

    service = new MoviesService(repository);
  });

  it('returns paginated movies and metadata', async () => {
    const result = await service.findAll({ page: 2, limit: 4, sort: 'oldest' });

    expect(query.orderBy.mock.calls).toContainEqual([
      'movie.releaseYear',
      'ASC',
    ]);
    expect(query.skip.mock.calls).toContainEqual([4]);
    expect(query.take.mock.calls).toContainEqual([4]);
    expect(result).toEqual({
      data: [{ id: 1 }],
      page: 2,
      limit: 4,
      total: 9,
      totalPages: 3,
    });
  });

  it('uses safe values for invalid pagination input', async () => {
    const result = await service.findAll({ page: 0, limit: 0 });

    expect(query.orderBy.mock.calls).toContainEqual([
      'movie.releaseYear',
      'DESC',
    ]);
    expect(query.skip.mock.calls).toContainEqual([0]);
    expect(query.take.mock.calls).toContainEqual([1]);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(1);
  });

  it('handles null options and empty results', async () => {
    query.getManyAndCount.mockResolvedValue([[], 0]);

    const result = await service.findAll(null);

    expect(query.skip.mock.calls).toContainEqual([0]);
    expect(query.take.mock.calls).toContainEqual([10]);
    expect(result).toEqual({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
  });

  it('propagates repository errors for Nest exception handling', async () => {
    const databaseError = new Error('Database unavailable');
    query.getManyAndCount.mockRejectedValue(databaseError);

    await expect(service.findAll()).rejects.toThrow('Database unavailable');
  });
});
