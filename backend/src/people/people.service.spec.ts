import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PeopleService } from './people.service';
import { Person } from './person.entity';
import { PersonMovieCredit } from './person-movie-credit.entity';
import { Award } from './award.entity';
import { Movie } from '../movies/movie.entity';
import { TmdbService } from '../tmdb/tmdb.service';
import { WikidataService } from '../wikidata/wikidata.service';

const mockPersonRepository = {
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockCreditRepository = {
  find: jest.fn<Promise<unknown[]>, [unknown]>(),
  upsert: jest.fn<Promise<unknown>, [unknown[], string[]]>(),
};

const mockAwardRepository = {
  find: jest.fn<Promise<unknown[]>, [unknown]>(),
  upsert: jest.fn<Promise<unknown>, [unknown[], string[]]>(),
};

const mockMovieRepository = {
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockTmdbService = {
  getPerson: jest.fn(),
  getPersonMovieCredits: jest.fn(),
  getMovie: jest.fn(),
  imageUrl: jest.fn((path: string | null) =>
    path ? `https://image.tmdb.org/t/p/w500${path}` : null,
  ),
};

const mockWikidataService = {
  getAwards: jest.fn(),
  getAwardsForPeople: jest.fn(),
};

describe('PeopleService', () => {
  let service: PeopleService;

  const buildPerson = (overrides: Partial<Person> = {}): Person =>
    ({
      id: 1,
      uuid: 'person-uuid',
      tmdbId: 31,
      imdbId: 'nm0000158',
      name: 'Tom Hanks',
      photoUrl: null,
      biography: null,
      gender: null,
      birthdate: null,
      placeOfBirth: null,
      knownFor: null,
      detailsFetchedAt: null,
      detailsLastAttemptAt: null,
      detailsStatus: 'pending',
      ...overrides,
    }) as Person;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeopleService,
        { provide: getRepositoryToken(Person), useValue: mockPersonRepository },
        {
          provide: getRepositoryToken(PersonMovieCredit),
          useValue: mockCreditRepository,
        },
        { provide: getRepositoryToken(Award), useValue: mockAwardRepository },
        { provide: getRepositoryToken(Movie), useValue: mockMovieRepository },
        { provide: TmdbService, useValue: mockTmdbService },
        { provide: WikidataService, useValue: mockWikidataService },
      ],
    }).compile();

    service = module.get<PeopleService>(PeopleService);

    mockCreditRepository.find.mockResolvedValue([]);
    mockAwardRepository.find.mockResolvedValue([]);
    mockMovieRepository.find.mockResolvedValue([]);
    mockMovieRepository.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    });
    mockCreditRepository.upsert.mockResolvedValue({});
    mockAwardRepository.upsert.mockResolvedValue({});
    mockPersonRepository.update.mockResolvedValue({});
    mockWikidataService.getAwards.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws NotFoundException for an unknown person', async () => {
    mockPersonRepository.findOne.mockResolvedValue(null);

    await expect(service.findDetails('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns the personal information with the calculated age', async () => {
    const person = buildPerson({
      biography: 'A biography',
      gender: 'Male',
      birthdate: '1956-07-09',
      placeOfBirth: 'Concord, California, USA',
      knownFor: 'Acting',
      detailsFetchedAt: new Date(),
      detailsStatus: 'complete',
    });
    mockPersonRepository.findOne.mockResolvedValue(person);

    const result = await service.findDetails('person-uuid');

    expect(result).toMatchObject({
      uuid: 'person-uuid',
      name: 'Tom Hanks',
      biography: 'A biography',
      gender: 'Male',
      birthdate: '1956-07-09',
      placeOfBirth: 'Concord, California, USA',
      knownFor: 'Acting',
      acting: [],
      awards: [],
    });
    expect(result.age).toBe(70);
  });

  it('hydrates a person without details and stores the credits', async () => {
    const person = buildPerson();
    mockPersonRepository.findOne.mockResolvedValue(person);
    mockTmdbService.getPerson.mockResolvedValue({
      id: 31,
      name: 'Tom Hanks',
      biography: 'A biography',
      birthday: '1956-07-09',
      deathday: null,
      gender: 2,
      place_of_birth: 'Concord, California, USA',
      known_for_department: 'Acting',
      profile_path: '/photo.jpg',
      imdb_id: 'nm0000158',
      popularity: 82,
    });
    mockTmdbService.getPersonMovieCredits.mockResolvedValue([
      {
        id: 13,
        title: 'Forrest Gump',
        release_date: '1994-06-23',
        character: 'Forrest Gump',
        poster_path: '/poster.jpg',
        order: 0,
        credit_id: 'credit-1',
      },
    ]);

    const result = await service.findDetails('person-uuid');

    expect(mockTmdbService.getPerson).toHaveBeenCalledWith(31);
    expect(mockCreditRepository.upsert).toHaveBeenCalledTimes(1);
    const rows = mockCreditRepository.upsert.mock.calls[0][0] as {
      title: string;
      characterName: string;
      releaseYear: number;
      movieId: number | null;
    }[];
    expect(rows[0]).toMatchObject({
      title: 'Forrest Gump',
      characterName: 'Forrest Gump',
      releaseYear: 1994,
      movieId: null,
    });
    expect(result.age).toBe(70);
  });

  it('links a credit to a local movie only when title and year match', async () => {
    const person = buildPerson();
    mockPersonRepository.findOne.mockResolvedValue(person);
    mockTmdbService.getPerson.mockResolvedValue({
      id: 31,
      name: 'Tom Hanks',
      biography: null,
      birthday: null,
      deathday: null,
      gender: 0,
      place_of_birth: null,
      known_for_department: null,
      profile_path: null,
      imdb_id: 'nm0000158',
      popularity: 82,
    });
    mockTmdbService.getPersonMovieCredits.mockResolvedValue([
      {
        id: 13,
        title: 'Forrest Gump',
        release_date: '1994-06-23',
        character: 'Forrest Gump',
        poster_path: null,
        order: 0,
        credit_id: 'credit-1',
      },
      {
        id: 99,
        title: 'Forrest Gump',
        release_date: '1986-01-01',
        character: 'Other',
        poster_path: null,
        order: 1,
        credit_id: 'credit-2',
      },
    ]);

    mockMovieRepository.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getMany: jest
        .fn()
        .mockResolvedValue([
          { id: 7, title: 'Forrest Gump', releaseYear: 1994 } as Movie,
        ]),
    });

    await service.findDetails('person-uuid');

    const rows = mockCreditRepository.upsert.mock.calls[0][0] as {
      title: string;
      releaseYear: number;
      movieId: number | null;
    }[];
    expect(rows[0].movieId).toBe(7);
    expect(rows[1].movieId).toBeNull();
  });

  it('does not refresh data that is still fresh', async () => {
    mockPersonRepository.findOne.mockResolvedValue(
      buildPerson({
        detailsFetchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        detailsStatus: 'complete',
        biography: 'A biography',
      }),
    );

    await service.findDetails('person-uuid');

    expect(mockTmdbService.getPerson).not.toHaveBeenCalled();
  });

  it('refreshes data that is older than seven days', async () => {
    mockPersonRepository.findOne.mockResolvedValue(
      buildPerson({
        detailsFetchedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        detailsStatus: 'complete',
        biography: 'A biography',
      }),
    );
    mockTmdbService.getPerson.mockResolvedValue({
      id: 31,
      name: 'Tom Hanks',
      biography: 'A biography',
      birthday: '1956-07-09',
      deathday: null,
      gender: 2,
      place_of_birth: null,
      known_for_department: 'Acting',
      profile_path: null,
      imdb_id: 'nm0000158',
      popularity: 82,
    });
    mockTmdbService.getPersonMovieCredits.mockResolvedValue([]);

    await service.findDetails('person-uuid');

    expect(mockTmdbService.getPerson).toHaveBeenCalledWith(31);
  });

  it('does not retry a failed refresh within 24 hours', async () => {
    mockPersonRepository.findOne.mockResolvedValue(
      buildPerson({
        detailsStatus: 'failed',
        detailsFetchedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        detailsLastAttemptAt: new Date(Date.now() - 60 * 60 * 1000),
        biography: 'A biography',
      }),
    );

    await service.findDetails('person-uuid');

    expect(mockTmdbService.getPerson).not.toHaveBeenCalled();
  });

  it('keeps working when the source fails and marks the refresh as failed', async () => {
    const person = buildPerson();
    mockPersonRepository.findOne.mockResolvedValue(person);
    mockTmdbService.getPerson.mockRejectedValue(new Error('TMDB is down'));
    mockTmdbService.getPersonMovieCredits.mockRejectedValue(
      new Error('TMDB is down'),
    );

    const result = await service.findDetails('person-uuid');

    expect(result.uuid).toBe('person-uuid');
    expect(mockPersonRepository.update).toHaveBeenCalledWith(
      person.id,
      expect.objectContaining({ detailsStatus: 'failed' }),
    );
  });

  it('does not mark a partial failure as a complete refresh', async () => {
    const person = buildPerson();
    mockPersonRepository.findOne.mockResolvedValue(person);
    mockTmdbService.getPerson.mockResolvedValue({
      id: 31,
      name: 'Tom Hanks',
      biography: 'A biography',
      birthday: '1956-07-09',
      deathday: null,
      gender: 2,
      place_of_birth: null,
      known_for_department: 'Acting',
      profile_path: null,
      imdb_id: 'nm0000158',
      popularity: 82,
    });
    mockTmdbService.getPersonMovieCredits.mockResolvedValue([]);
    mockWikidataService.getAwards.mockRejectedValue(new Error('Wikidata down'));

    await service.findDetails('person-uuid');

    expect(mockPersonRepository.update).toHaveBeenCalledWith(
      person.id,
      expect.objectContaining({ detailsStatus: 'failed' }),
    );
  });

  it('hydrates only once for concurrent requests', async () => {
    const person = buildPerson();
    mockPersonRepository.findOne.mockResolvedValue(person);
    mockTmdbService.getPerson.mockResolvedValue({
      id: 31,
      name: 'Tom Hanks',
      biography: 'A biography',
      birthday: '1956-07-09',
      deathday: null,
      gender: 2,
      place_of_birth: null,
      known_for_department: 'Acting',
      profile_path: null,
      imdb_id: 'nm0000158',
      popularity: 82,
    });
    mockTmdbService.getPersonMovieCredits.mockResolvedValue([]);

    await Promise.all([
      service.findDetails('person-uuid'),
      service.findDetails('person-uuid'),
      service.findDetails('person-uuid'),
    ]);

    expect(mockTmdbService.getPerson).toHaveBeenCalledTimes(1);
  });

  it('resolves the poster of the work an award refers to', async () => {
    const person = buildPerson();
    mockPersonRepository.findOne.mockResolvedValue(person);
    mockTmdbService.getPerson.mockResolvedValue({
      id: 31,
      name: 'Tom Hanks',
      biography: 'A biography',
      birthday: '1956-07-09',
      deathday: null,
      gender: 2,
      place_of_birth: null,
      known_for_department: 'Acting',
      profile_path: null,
      imdb_id: 'nm0000158',
      popularity: 82,
    });
    mockTmdbService.getPersonMovieCredits.mockResolvedValue([]);
    mockWikidataService.getAwards.mockResolvedValue([
      {
        sourceId: 'Q2263-1',
        label: 'Academy Award for Best Actor',
        awardName: 'Academy Award',
        category: 'Best Actor',
        year: 1995,
        result: 'Winner',
        workTitle: 'Forrest Gump',
        workYear: 1994,
        workTmdbId: 13,
      },
    ]);
    mockTmdbService.getMovie.mockResolvedValue({
      id: 13,
      title: 'Forrest Gump',
      release_date: '1994-06-23',
      poster_path: '/forrest.jpg',
    });

    await service.findDetails('person-uuid');

    expect(mockTmdbService.getMovie).toHaveBeenCalledWith(13);
    const rows = mockAwardRepository.upsert.mock.calls[0][0] as {
      posterUrl: string | null;
      associatedMovieTitle: string;
    }[];
    expect(rows[0].posterUrl).toBe(
      'https://image.tmdb.org/t/p/w500/forrest.jpg',
    );
    expect(rows[0].associatedMovieTitle).toBe('Forrest Gump');
  });

  it('keeps a stored award poster when the source delivers no poster', async () => {
    const person = buildPerson();
    mockPersonRepository.findOne.mockResolvedValue(person);
    mockTmdbService.getPerson.mockResolvedValue({
      id: 31,
      name: 'Tom Hanks',
      biography: 'A biography',
      birthday: '1956-07-09',
      deathday: null,
      gender: 2,
      place_of_birth: null,
      known_for_department: 'Acting',
      profile_path: null,
      imdb_id: 'nm0000158',
      popularity: 82,
    });
    mockTmdbService.getPersonMovieCredits.mockResolvedValue([]);
    mockAwardRepository.find.mockResolvedValue([
      {
        id: 1,
        personId: 1,
        movieId: null,
        year: 1995,
        body: 'Academy Award for Best Actor',
        category: 'Best Actor',
        result: 'Winner',
        associatedMovieTitle: 'Forrest Gump',
        associatedMovieYear: 1994,
        associatedTmdbMovieId: 13,
        posterUrl: 'https://image.tmdb.org/t/p/w500/stored.jpg',
        source: 'wikidata',
        sourceId: 'Q2263-1',
      },
    ]);
    mockWikidataService.getAwards.mockResolvedValue([
      {
        sourceId: 'Q2263-1',
        label: 'Academy Award for Best Actor',
        awardName: 'Academy Award',
        category: 'Best Actor',
        year: 1995,
        result: 'Winner',
        workTitle: 'Forrest Gump',
        workYear: 1994,
        workTmdbId: 13,
      },
    ]);

    await service.findDetails('person-uuid');

    expect(mockTmdbService.getMovie).not.toHaveBeenCalled();
    const rows = mockAwardRepository.upsert.mock.calls[0][0] as {
      posterUrl: string | null;
    }[];
    expect(rows[0].posterUrl).toBe(
      'https://image.tmdb.org/t/p/w500/stored.jpg',
    );
  });

  it('uses the poster of the local movie for a credit without a poster', async () => {
    const person = buildPerson();
    mockPersonRepository.findOne.mockResolvedValue(person);
    mockTmdbService.getPerson.mockResolvedValue({
      id: 31,
      name: 'Tom Hanks',
      biography: 'A biography',
      birthday: '1956-07-09',
      deathday: null,
      gender: 2,
      place_of_birth: null,
      known_for_department: 'Acting',
      profile_path: null,
      imdb_id: 'nm0000158',
      popularity: 82,
    });
    mockTmdbService.getPersonMovieCredits.mockResolvedValue([
      {
        id: 13,
        title: 'Forrest Gump',
        release_date: '1994-06-23',
        character: 'Forrest Gump',
        poster_path: null,
        order: 0,
        credit_id: 'credit-1',
      },
    ]);
    mockMovieRepository.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 7,
          title: 'Forrest Gump',
          releaseYear: 1994,
          posterUrl: 'https://image.tmdb.org/t/p/w500/local.jpg',
        } as Movie,
      ]),
    });

    await service.findDetails('person-uuid');

    const rows = mockCreditRepository.upsert.mock.calls[0][0] as {
      posterUrl: string | null;
      movieId: number | null;
    }[];
    expect(rows[0].movieId).toBe(7);
    expect(rows[0].posterUrl).toBe('https://image.tmdb.org/t/p/w500/local.jpg');
  });

  it('returns the date of death and the age at death', async () => {
    mockPersonRepository.findOne.mockResolvedValue(
      buildPerson({
        detailsFetchedAt: new Date(),
        detailsStatus: 'complete',
        biography: 'A biography',
        birthdate: '1889-04-16',
        deathdate: '1977-12-25',
      }),
    );

    const result = await service.findDetails('person-uuid');

    expect(result.deathdate).toBe('1977-12-25');
    expect(result.age).toBe(88);
  });

  it('stores the date of death delivered by the source', async () => {
    const person = buildPerson();
    mockPersonRepository.findOne.mockResolvedValue(person);
    mockTmdbService.getPerson.mockResolvedValue({
      id: 13848,
      name: 'Charlie Chaplin',
      biography: 'A biography',
      birthday: '1889-04-16',
      deathday: '1977-12-25',
      gender: 2,
      place_of_birth: 'Walworth, London, England, UK',
      known_for_department: 'Acting',
      profile_path: null,
      imdb_id: 'nm0000123',
      popularity: 82,
    });
    mockTmdbService.getPersonMovieCredits.mockResolvedValue([]);

    const result = await service.findDetails('person-uuid');

    expect(mockPersonRepository.update).toHaveBeenCalledWith(
      person.id,
      expect.objectContaining({ deathdate: '1977-12-25' }),
    );
    expect(result.deathdate).toBe('1977-12-25');
    expect(result.age).toBe(88);
  });

  it('returns the stored credits and awards of a person', async () => {
    mockPersonRepository.findOne.mockResolvedValue(
      buildPerson({
        detailsFetchedAt: new Date(),
        detailsStatus: 'complete',
        biography: 'A biography',
      }),
    );
    mockCreditRepository.find.mockResolvedValue([
      {
        id: 1,
        personId: 1,
        movieId: 7,
        tmdbMovieId: 13,
        title: 'Forrest Gump',
        releaseYear: 1994,
        characterName: 'Forrest Gump',
        posterUrl: null,
        billingOrder: 0,
        source: 'tmdb',
        sourceId: 'credit-1',
      },
    ]);
    mockAwardRepository.find.mockResolvedValue([
      {
        id: 1,
        personId: 1,
        movieId: 7,
        year: 1995,
        body: 'Academy Award for Best Actor',
        category: 'Best Actor',
        result: 'Winner',
        associatedMovieTitle: 'Forrest Gump',
        associatedMovieYear: 1994,
        associatedTmdbMovieId: 13,
        posterUrl: null,
        source: 'wikidata',
        sourceId: 'statement-1',
      },
    ]);
    mockMovieRepository.find.mockResolvedValue([
      {
        id: 7,
        uuid: 'movie-uuid',
        title: 'Forrest Gump',
        releaseYear: 1994,
        posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      } as Movie,
    ]);

    const result = await service.findDetails('person-uuid');

    expect(result.acting).toEqual([
      {
        title: 'Forrest Gump',
        characterName: 'Forrest Gump',
        releaseYear: 1994,
        posterUrl: null,
        movieUuid: 'movie-uuid',
      },
    ]);
    expect(result.awards).toEqual([
      {
        year: 1995,
        status: 'Winner',
        awardName: 'Academy Award',
        awardCategory: 'Best Actor',
        associatedMovieTitle: 'Forrest Gump',
        associatedMovieYear: 1994,
        movieUuid: 'movie-uuid',
        posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      },
    ]);
  });
});
