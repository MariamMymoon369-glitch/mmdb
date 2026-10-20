import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Person } from './person.entity';
import { PersonMovieCredit } from './person-movie-credit.entity';
import { Award } from './award.entity';
import { Movie } from '../movies/movie.entity';
import { TmdbService } from '../tmdb/tmdb.service';
import { WikidataService } from '../wikidata/wikidata.service';
import { deriveAwardName } from '../wikidata/award-label';
import {
  ActingCreditDto,
  AwardEntryDto,
  PersonDetailsDto,
} from './dto/person-details.dto';
import {
  calculateAge,
  extractReleaseYear,
  mapTmdbPersonFields,
  normalizeTitle,
} from './person-details.mapper';
import { TmdbMovieCredit, TmdbPersonDetail } from '../tmdb/tmdb.types';
import { WikidataAward } from '../wikidata/wikidata.types';

const REVALIDATION_MS = 7 * 24 * 60 * 60 * 1000;
const FAILED_RETRY_MS = 24 * 60 * 60 * 1000;
const TMDB_LOOKUP_CONCURRENCY = 5;

interface CreditRow {
  personId: number;
  movieId: number | null;
  tmdbMovieId: number;
  title: string;
  releaseYear: number | null;
  characterName: string;
  posterUrl: string | null;
  billingOrder: number | null;
  source: string;
  sourceId: string | null;
}

interface AwardRow {
  personId: number;
  movieId: number | null;
  year: number | null;
  body: string | null;
  category: string | null;
  result: string | null;
  associatedMovieTitle: string | null;
  associatedMovieYear: number | null;
  associatedTmdbMovieId: number | null;
  posterUrl: string | null;
  source: string;
  sourceId: string | null;
}

interface WorkMovie {
  title: string;
  releaseDate: string | null;
  posterUrl: string | null;
}

@Injectable()
export class PeopleService {
  private readonly logger = new Logger(PeopleService.name);

  private readonly inFlightHydrations = new Map<
    number,
    Promise<'complete' | 'failed'>
  >();

  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(PersonMovieCredit)
    private readonly creditRepository: Repository<PersonMovieCredit>,
    @InjectRepository(Award)
    private readonly awardRepository: Repository<Award>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly tmdbService: TmdbService,
    private readonly wikidataService: WikidataService,
  ) {}

  async findByUuid(uuid: string): Promise<Person> {
    const person = await this.personRepository.findOne({ where: { uuid } });
    if (!person) {
      throw new NotFoundException('Person not found');
    }
    return person;
  }

  async findDetails(uuid: string): Promise<PersonDetailsDto> {
    const person = await this.findByUuid(uuid);
    await this.hydrateIfNeeded(person);
    return this.buildDetails(person);
  }

  private async hydrateIfNeeded(person: Person): Promise<void> {
    if (!person.tmdbId) {
      return;
    }

    if (!this.isHydrationDue(person)) {
      return;
    }

    const running = this.inFlightHydrations.get(person.id);
    if (running) {
      await running;
      return;
    }

    const hydration = this.runHydration(person, true).finally(() => {
      this.inFlightHydrations.delete(person.id);
    });
    this.inFlightHydrations.set(person.id, hydration);

    if (this.hasLocalDetails(person)) {
      return;
    }

    await hydration;
  }

  private isHydrationDue(person: Person): boolean {
    const now = Date.now();

    if (person.detailsStatus === 'failed' && person.detailsLastAttemptAt) {
      if (now - person.detailsLastAttemptAt.getTime() < FAILED_RETRY_MS) {
        return false;
      }
    }

    if (!person.detailsFetchedAt) {
      return true;
    }

    return now - person.detailsFetchedAt.getTime() >= REVALIDATION_MS;
  }

  private hasLocalDetails(person: Person): boolean {
    return Boolean(
      person.biography ||
      person.birthdate ||
      person.knownFor ||
      person.placeOfBirth,
    );
  }

  async refreshDetails(
    person: Person,
    options: { includeAwards?: boolean } = {},
  ): Promise<'complete' | 'failed'> {
    return this.runHydration(person, options.includeAwards !== false);
  }

  async saveAwards(person: Person, awards: WikidataAward[]): Promise<void> {
    await this.storeAwards(person, awards);
  }

  private async runHydration(
    person: Person,
    includeAwards: boolean,
  ): Promise<'complete' | 'failed'> {
    const tmdbId = person.tmdbId;
    if (!tmdbId) {
      return 'complete';
    }

    let failed = false;

    try {
      const detail = await this.tmdbService.getPerson(tmdbId);
      await this.applyPersonDetail(person, detail);
    } catch (error) {
      failed = true;
      this.logger.warn(
        `TMDB person details failed for tmdb id ${tmdbId}: ${this.describe(error)}`,
      );
    }

    try {
      const credits = await this.tmdbService.getPersonMovieCredits(tmdbId);
      await this.storeCredits(person, credits);
    } catch (error) {
      failed = true;
      this.logger.warn(
        `TMDB movie credits failed for tmdb id ${tmdbId}: ${this.describe(error)}`,
      );
    }

    if (includeAwards && person.imdbId) {
      try {
        const awards = await this.wikidataService.getAwards(person.imdbId);
        await this.storeAwards(person, awards);
      } catch (error) {
        failed = true;
        this.logger.warn(
          `Wikidata awards failed for imdb id ${person.imdbId}: ${this.describe(error)}`,
        );
      }
    }

    const status = failed ? 'failed' : 'complete';
    await this.personRepository.update(person.id, {
      detailsLastAttemptAt: new Date(),
      detailsFetchedAt: failed ? person.detailsFetchedAt : new Date(),
      detailsStatus: status,
    });

    return status;
  }

  private async applyPersonDetail(
    person: Person,
    detail: TmdbPersonDetail,
  ): Promise<void> {
    const fields = mapTmdbPersonFields(detail, (path) =>
      this.tmdbService.imageUrl(path),
    );

    const patch: Partial<Person> = {};
    if (fields.biography) patch.biography = fields.biography;
    if (fields.gender) patch.gender = fields.gender;
    if (fields.birthdate) patch.birthdate = fields.birthdate;
    if (fields.deathdate) patch.deathdate = fields.deathdate;
    if (fields.placeOfBirth) patch.placeOfBirth = fields.placeOfBirth;
    if (fields.knownFor) patch.knownFor = fields.knownFor;
    if (fields.photoUrl) patch.photoUrl = fields.photoUrl;
    if (fields.imdbId) patch.imdbId = fields.imdbId;

    if (Object.keys(patch).length === 0) {
      return;
    }

    await this.personRepository.update(person.id, patch);
    Object.assign(person, patch);
  }

  private async storeCredits(
    person: Person,
    credits: TmdbMovieCredit[],
  ): Promise<void> {
    if (credits.length === 0) {
      return;
    }

    const rows: CreditRow[] = credits.map((credit) => ({
      personId: person.id,
      movieId: null,
      tmdbMovieId: credit.id,
      title: credit.title,
      releaseYear: extractReleaseYear(credit.release_date),
      characterName: this.normalizeCharacterName(credit.character),
      posterUrl: this.tmdbService.imageUrl(credit.poster_path),
      billingOrder: credit.order ?? null,
      source: 'tmdb',
      sourceId: credit.credit_id ?? null,
    }));

    const matches = await this.resolveLocalMovies(
      rows.map((row) => ({ title: row.title, year: row.releaseYear })),
    );
    for (const row of rows) {
      const match = matches.get(this.movieKey(row.title, row.releaseYear));
      row.movieId = match?.id ?? null;
      row.posterUrl = row.posterUrl ?? match?.posterUrl ?? null;
    }

    await this.creditRepository.upsert(rows, [
      'personId',
      'tmdbMovieId',
      'characterName',
    ]);
  }

  private async storeAwards(
    person: Person,
    awards: WikidataAward[],
  ): Promise<void> {
    if (awards.length === 0) {
      return;
    }

    const stored = await this.awardRepository.find({
      where: { personId: person.id },
    });
    const storedBySourceId = new Map(
      stored.map((award) => [award.sourceId, award]),
    );

    const workMovies = await this.fetchWorkMovies(awards, storedBySourceId);

    const rows: AwardRow[] = awards.map((award) => {
      const work =
        award.workTmdbId === null
          ? undefined
          : workMovies.get(award.workTmdbId);
      const existing = storedBySourceId.get(award.sourceId);

      return {
        personId: person.id,
        movieId: null,
        year: award.year ?? existing?.year ?? null,
        body: award.label,
        category: award.category ?? existing?.category ?? null,
        result: award.result,
        associatedMovieTitle:
          award.workTitle ??
          work?.title ??
          existing?.associatedMovieTitle ??
          null,
        associatedMovieYear:
          award.workYear ??
          extractReleaseYear(work?.releaseDate) ??
          existing?.associatedMovieYear ??
          null,
        associatedTmdbMovieId:
          award.workTmdbId ?? existing?.associatedTmdbMovieId ?? null,
        posterUrl: work?.posterUrl ?? existing?.posterUrl ?? null,
        source: 'wikidata',
        sourceId: award.sourceId,
      };
    });

    const moviesByTmdbId = await this.buildLocalMovieMap(person.id);
    const matches = await this.resolveLocalMovies(
      rows.map((row) => ({
        title: row.associatedMovieTitle ?? '',
        year: row.associatedMovieYear,
      })),
    );

    for (const row of rows) {
      const byTmdbId =
        row.associatedTmdbMovieId === null
          ? undefined
          : moviesByTmdbId.get(row.associatedTmdbMovieId);
      const byTitle = matches.get(
        this.movieKey(row.associatedMovieTitle ?? '', row.associatedMovieYear),
      );
      const match = byTmdbId ?? byTitle;

      row.movieId = match?.id ?? null;
      if (match) {
        if (!row.associatedMovieTitle) {
          row.associatedMovieTitle = match.title;
        }
        if (!row.associatedMovieYear) {
          row.associatedMovieYear = match.releaseYear;
        }
        row.posterUrl = match.posterUrl ?? row.posterUrl;
      }
    }

    await this.awardRepository.upsert(rows, ['personId', 'source', 'sourceId']);
  }

  private async fetchWorkMovies(
    awards: WikidataAward[],
    storedBySourceId: Map<string | null, Award>,
  ): Promise<Map<number, WorkMovie>> {
    const needed = new Set<number>();

    for (const award of awards) {
      if (award.workTmdbId === null) {
        continue;
      }
      const existing = storedBySourceId.get(award.sourceId);
      const hasPoster = Boolean(existing?.posterUrl);
      const hasTitle = Boolean(
        award.workTitle ?? existing?.associatedMovieTitle,
      );
      const hasYear =
        award.workYear !== null || existing?.associatedMovieYear != null;

      if (!hasPoster || !hasTitle || !hasYear) {
        needed.add(award.workTmdbId);
      }
    }

    if (needed.size === 0) {
      return new Map();
    }

    return this.fetchMoviesFromTmdb([...needed]);
  }

  private async fetchMoviesFromTmdb(
    movieIds: number[],
  ): Promise<Map<number, WorkMovie>> {
    const movies = new Map<number, WorkMovie>();
    const queue = [...movieIds];

    const workers = Array.from(
      { length: Math.min(TMDB_LOOKUP_CONCURRENCY, queue.length) },
      async () => {
        while (queue.length > 0) {
          const movieId = queue.shift() as number;
          try {
            const movie = await this.tmdbService.getMovie(movieId);
            movies.set(movieId, {
              title: movie.title,
              releaseDate: movie.release_date,
              posterUrl: this.tmdbService.imageUrl(movie.poster_path),
            });
          } catch (error) {
            this.logger.warn(
              `TMDB movie ${movieId} failed: ${this.describe(error)}`,
            );
          }
        }
      },
    );

    await Promise.all(workers);
    return movies;
  }

  private normalizeCharacterName(character: string | undefined): string {
    const trimmed = (character ?? '').trim();
    if (trimmed.length === 0) {
      return 'Unknown';
    }
    return trimmed.length > 255 ? `${trimmed.slice(0, 252)}...` : trimmed;
  }

  async relinkCredits(): Promise<number> {
    const pairs = (await this.creditRepository.query(
      `SELECT DISTINCT title, release_year FROM person_movie_credits WHERE movie_id IS NULL`,
    )) as unknown as { title: string; release_year: number | null }[];

    if (pairs.length === 0) {
      return 0;
    }

    let linked = 0;
    const chunkSize = 500;

    for (let index = 0; index < pairs.length; index += chunkSize) {
      const chunk = pairs.slice(index, index + chunkSize);
      const matches = await this.resolveLocalMovies(
        chunk.map((pair) => ({
          title: pair.title,
          year: pair.release_year,
        })),
      );

      for (const pair of chunk) {
        const match = matches.get(this.movieKey(pair.title, pair.release_year));
        if (!match) {
          continue;
        }

        const result = await this.creditRepository
          .createQueryBuilder()
          .update()
          .set({ movieId: match.id })
          .where('movie_id IS NULL')
          .andWhere('LOWER(TRIM(title)) = LOWER(:title)', { title: pair.title })
          .andWhere(
            pair.release_year === null
              ? 'release_year IS NULL'
              : 'release_year = :year',
            { year: pair.release_year },
          )
          .execute();

        linked += result.affected ?? 0;
      }
    }

    return linked;
  }

  private async buildLocalMovieMap(
    personId: number,
  ): Promise<Map<number, Movie>> {
    const credits = await this.creditRepository.find({
      where: { personId },
    });

    const localIdByTmdbId = new Map<number, number>();
    for (const credit of credits) {
      if (credit.movieId === null) continue;
      if (!localIdByTmdbId.has(credit.tmdbMovieId)) {
        localIdByTmdbId.set(credit.tmdbMovieId, credit.movieId);
      }
    }

    if (localIdByTmdbId.size === 0) {
      return new Map();
    }

    const movies = await this.movieRepository.find({
      where: { id: In([...new Set(localIdByTmdbId.values())]) },
    });
    const movieById = new Map(movies.map((movie) => [movie.id, movie]));

    const result = new Map<number, Movie>();
    for (const [tmdbId, localId] of localIdByTmdbId) {
      const movie = movieById.get(localId);
      if (movie) result.set(tmdbId, movie);
    }
    return result;
  }

  private async resolveLocalMovies(
    candidates: { title: string; year: number | null }[],
  ): Promise<Map<string, Movie>> {
    const titles = [
      ...new Set(
        candidates
          .map((candidate) => candidate.title.trim())
          .filter((title) => title.length > 0),
      ),
    ];

    const result = new Map<string, Movie>();
    if (titles.length === 0) {
      return result;
    }

    const movies = await this.movieRepository
      .createQueryBuilder('movie')
      .where('LOWER(TRIM(movie.title)) IN (:...titles)', {
        titles: titles.map((title) => title.toLowerCase()),
      })
      .getMany();

    const byNormalizedTitle = new Map<string, Movie[]>();
    for (const movie of movies) {
      const key = normalizeTitle(movie.title);
      const bucket = byNormalizedTitle.get(key);
      if (bucket) {
        bucket.push(movie);
      } else {
        byNormalizedTitle.set(key, [movie]);
      }
    }

    for (const candidate of candidates) {
      const bucket = byNormalizedTitle.get(normalizeTitle(candidate.title));
      if (!bucket || bucket.length === 0) {
        continue;
      }

      const exact =
        candidate.year === null
          ? bucket.length === 1
            ? bucket
            : []
          : bucket.filter((movie) => movie.releaseYear === candidate.year);

      if (exact.length === 1) {
        result.set(this.movieKey(candidate.title, candidate.year), exact[0]);
      }
    }

    return result;
  }

  private movieKey(title: string, year: number | null): string {
    return `${normalizeTitle(title)}::${year ?? 'any'}`;
  }

  private async buildDetails(person: Person): Promise<PersonDetailsDto> {
    const [credits, awards] = await Promise.all([
      this.creditRepository.find({ where: { personId: person.id } }),
      this.awardRepository.find({ where: { personId: person.id } }),
    ]);

    const sortedCredits = [...credits].sort((a, b) => {
      if (a.releaseYear === null && b.releaseYear === null) {
        return a.title.localeCompare(b.title);
      }
      if (a.releaseYear === null) return 1;
      if (b.releaseYear === null) return -1;
      if (a.releaseYear !== b.releaseYear) return b.releaseYear - a.releaseYear;
      return a.title.localeCompare(b.title);
    });

    const sortedAwards = [...awards].sort((a, b) => {
      const yearA = a.year ?? -1;
      const yearB = b.year ?? -1;
      if (yearA !== yearB) return yearB - yearA;
      return (a.body ?? '').localeCompare(b.body ?? '');
    });

    const movieIds = [
      ...new Set(
        [
          ...sortedCredits.map((credit) => credit.movieId),
          ...sortedAwards.map((award) => award.movieId),
        ].filter((id): id is number => id !== null),
      ),
    ];

    const movies = movieIds.length
      ? await this.movieRepository.find({ where: { id: In(movieIds) } })
      : [];
    const movieById = new Map(movies.map((movie) => [movie.id, movie]));

    const acting: ActingCreditDto[] = sortedCredits.map((credit) => ({
      title: credit.title,
      characterName: credit.characterName,
      releaseYear: credit.releaseYear,
      posterUrl: credit.posterUrl,
      movieUuid:
        credit.movieId === null
          ? null
          : (movieById.get(credit.movieId)?.uuid ?? null),
    }));

    const awardEntries: AwardEntryDto[] = sortedAwards.map((award) => {
      const movie =
        award.movieId === null ? undefined : movieById.get(award.movieId);
      return {
        year: award.year,
        status: award.result ?? 'Nominated',
        awardName: award.body ? deriveAwardName(award.body) : 'Award',
        awardCategory: award.category,
        associatedMovieTitle: award.associatedMovieTitle,
        associatedMovieYear: award.associatedMovieYear,
        movieUuid: movie?.uuid ?? null,
        posterUrl: award.posterUrl ?? movie?.posterUrl ?? null,
      };
    });

    return {
      uuid: person.uuid,
      name: person.name,
      photoUrl: person.photoUrl,
      biography: person.biography,
      gender: person.gender,
      birthdate: person.birthdate,
      deathdate: person.deathdate,
      age: calculateAge(person.birthdate, person.deathdate),
      placeOfBirth: person.placeOfBirth,
      knownFor: person.knownFor,
      acting,
      awards: awardEntries,
    };
  }

  private describe(error: unknown): string {
    return error instanceof Error ? error.message : 'unknown error';
  }
}
