import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from '../movies/movie.entity';
import { Person } from '../people/person.entity';
import { SearchService } from './search.service';

interface QueryBuilderStub {
  where: jest.Mock<unknown, [string, Record<string, unknown>?]>;
  orderBy: jest.Mock<unknown, [string, string?]>;
  addOrderBy: jest.Mock<unknown, [string, string?]>;
  setParameter: jest.Mock<unknown, [string, unknown]>;
  take: jest.Mock<unknown, [number]>;
  getMany: jest.Mock<Promise<unknown[]>, []>;
}

describe('SearchService', () => {
  let service: SearchService;
  let movieBuilder: QueryBuilderStub;
  let personBuilder: QueryBuilderStub;

  const mockMovieRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockPersonRepository = {
    createQueryBuilder: jest.fn(),
  };

  const buildQueryBuilder = (rows: unknown[]): QueryBuilderStub => {
    const builder: QueryBuilderStub = {
      where: jest.fn<unknown, [string, Record<string, unknown>?]>(),
      orderBy: jest.fn<unknown, [string, string?]>(),
      addOrderBy: jest.fn<unknown, [string, string?]>(),
      setParameter: jest.fn<unknown, [string, unknown]>(),
      take: jest.fn<unknown, [number]>(),
      getMany: jest.fn<Promise<unknown[]>, []>().mockResolvedValue(rows),
    };

    builder.where.mockReturnValue(builder);
    builder.orderBy.mockReturnValue(builder);
    builder.addOrderBy.mockReturnValue(builder);
    builder.setParameter.mockReturnValue(builder);
    builder.take.mockReturnValue(builder);

    return builder;
  };

  const movie = (overrides: Partial<Movie> = {}) =>
    ({
      uuid: 'movie-uuid',
      title: 'Forrest Gump',
      releaseYear: 1994,
      posterUrl: 'https://image.tmdb.org/poster.jpg',
      rating: 8.8,
      reviewCount: 12,
      ...overrides,
    }) as Movie;

  const person = (overrides: Partial<Person> = {}) =>
    ({
      uuid: 'person-uuid',
      name: 'Tom Hanks',
      photoUrl: 'https://image.tmdb.org/photo.jpg',
      ...overrides,
    }) as Person;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(Movie), useValue: mockMovieRepository },
        { provide: getRepositoryToken(Person), useValue: mockPersonRepository },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);

    movieBuilder = buildQueryBuilder([movie()]);
    personBuilder = buildQueryBuilder([person()]);
    mockMovieRepository.createQueryBuilder.mockReturnValue(movieBuilder);
    mockPersonRepository.createQueryBuilder.mockReturnValue(personBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns an empty result for an empty query', async () => {
    const result = await service.search({ q: '   ', limit: 5 });

    expect(result).toEqual({ query: '', movies: [], people: [] });
    expect(mockMovieRepository.createQueryBuilder).not.toHaveBeenCalled();
    expect(mockPersonRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('searches movies by a part of the title and people by a part of the name', async () => {
    const result = await service.search({ q: 'hanks', limit: 5 });

    expect(result.query).toBe('hanks');
    expect(result.movies).toEqual([
      {
        uuid: 'movie-uuid',
        title: 'Forrest Gump',
        releaseYear: 1994,
        posterUrl: 'https://image.tmdb.org/poster.jpg',
        rating: 8.8,
        reviewCount: 12,
      },
    ]);
    expect(result.people).toEqual([
      {
        uuid: 'person-uuid',
        name: 'Tom Hanks',
        photoUrl: 'https://image.tmdb.org/photo.jpg',
      },
    ]);
  });

  it('matches partially and case insensitively', async () => {
    await service.search({ q: 'HANKS', limit: 5 });

    const whereCall = movieBuilder.where.mock.calls[0];

    expect(whereCall[0]).toContain('ILIKE');
    expect(whereCall[1]?.pattern).toBe('%HANKS%');
  });

  it('searches the people with the same pattern', async () => {
    await service.search({ q: 'hanks', limit: 5 });

    const whereCall = personBuilder.where.mock.calls[0];

    expect(whereCall[0]).toContain('person.name');
    expect(whereCall[1]?.pattern).toBe('%hanks%');
  });

  it('escapes the wildcards of the term so they match literally', async () => {
    await service.search({ q: '100%', limit: 5 });

    const whereCall = movieBuilder.where.mock.calls[0];

    expect(whereCall[1]?.pattern).toBe('%100\\%%');
  });

  it('bounds the number of results', async () => {
    await service.search({ q: 'a', limit: 3 });

    expect(movieBuilder.take).toHaveBeenCalledWith(3);
    expect(personBuilder.take).toHaveBeenCalledWith(3);
  });

  it('returns no results when nothing matches', async () => {
    mockMovieRepository.createQueryBuilder.mockReturnValue(
      buildQueryBuilder([]),
    );
    mockPersonRepository.createQueryBuilder.mockReturnValue(
      buildQueryBuilder([]),
    );

    const result = await service.search({ q: 'zzzz', limit: 5 });

    expect(result.movies).toEqual([]);
    expect(result.people).toEqual([]);
  });

  it('orders the exact match first and the shorter titles before the longer ones', async () => {
    await service.search({ q: 'star', limit: 5 });

    const orderCalls = [
      ...movieBuilder.orderBy.mock.calls,
      ...movieBuilder.addOrderBy.mock.calls,
    ].map((call) => call[0]);

    expect(orderCalls[0]).toContain('lower(movie.title) = :exact');
    expect(orderCalls[1]).toContain('lower(movie.title) LIKE :prefix');
    expect(orderCalls[2]).toBe('length(movie.title)');
    expect(orderCalls[3]).toBe('movie.rating');
  });
});
