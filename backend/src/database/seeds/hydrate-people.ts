import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { IsNull, Not } from 'typeorm';
import { DataSource } from 'typeorm';
import { Person } from '../../people/person.entity';
import { PersonMovieCredit } from '../../people/person-movie-credit.entity';
import { Award } from '../../people/award.entity';
import { Movie } from '../../movies/movie.entity';
import { PeopleService } from '../../people/people.service';
import { TmdbService } from '../../tmdb/tmdb.service';
import { WikidataService } from '../../wikidata/wikidata.service';

export interface HydrationOptions {
  limit?: number | null;
  concurrency?: number;
  castOnly?: boolean;
  skipAwards?: boolean;
  onProgress?: (message: string) => void;
}

export interface HydrationSummary {
  people: number;
  completed: number;
  failed: number;
  awardsStored: number;
  credits: number;
  linkedCredits: number;
  awards: number;
  linkedAwards: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        const item = items[index];
        await worker(item);
        if ((index + 1) % 25 === 0) {
          console.log(`  processed ${index + 1}/${items.length}`);
        }
      }
    },
  );

  await Promise.all(runners);
}

export async function hydratePeople(
  dataSource: DataSource,
  options: HydrationOptions = {},
): Promise<HydrationSummary> {
  const limit = options.limit ?? null;
  const concurrency = options.concurrency ?? 4;
  const castOnly = options.castOnly ?? false;
  const skipAwards = options.skipAwards ?? false;
  const report = options.onProgress ?? (() => undefined);

  const personRepository = dataSource.getRepository(Person);
  const creditRepository = dataSource.getRepository(PersonMovieCredit);
  const awardRepository = dataSource.getRepository(Award);
  const movieRepository = dataSource.getRepository(Movie);

  const wikidataService = new WikidataService();
  const peopleService = new PeopleService(
    personRepository,
    creditRepository,
    awardRepository,
    movieRepository,
    new TmdbService(new ConfigService(process.env)),
    wikidataService,
  );

  const people = castOnly
    ? await personRepository
        .createQueryBuilder('person')
        .innerJoin('movie_cast', 'cast', 'cast.person_id = person.id')
        .orderBy('person.id', 'ASC')
        .getMany()
    : await personRepository.find({ order: { id: 'ASC' } });

  const targets = people
    .filter((person) => person.tmdbId !== null)
    .slice(0, limit ?? undefined);

  report(
    `Hydrating ${targets.length} people (concurrency ${concurrency}, awards ${
      skipAwards ? 'skipped' : 'enabled'
    })`,
  );

  let completed = 0;
  let failed = 0;

  await runWithConcurrency(targets, concurrency, async (person) => {
    const status = await peopleService.refreshDetails(person, {
      includeAwards: false,
    });
    if (status === 'complete') {
      completed += 1;
    } else {
      failed += 1;
    }
    await sleep(50);
  });

  report(`TMDB hydration done: ${completed} complete, ${failed} failed`);

  let awardsStored = 0;
  if (!skipAwards) {
    const withImdb = await personRepository.find({
      where: { imdbId: Not(IsNull()) },
    });
    const imdbIds = withImdb
      .map((person) => person.imdbId)
      .filter((id): id is string => Boolean(id));

    report(`Fetching awards for ${imdbIds.length} people from Wikidata`);

    const byImdb = await wikidataService.getAwardsForPeople(imdbIds, {
      continueOnError: true,
    });
    report(`Wikidata returned awards for ${byImdb.size} people`);

    for (const person of withImdb) {
      const awards = person.imdbId ? byImdb.get(person.imdbId) : undefined;
      if (!awards || awards.length === 0) continue;
      await peopleService.saveAwards(person, awards);
      awardsStored += 1;
    }
    report(`Stored awards for ${awardsStored} people`);
  }

  return {
    people: targets.length,
    completed,
    failed,
    awardsStored,
    credits: await creditRepository.count(),
    linkedCredits: await creditRepository
      .createQueryBuilder('credit')
      .where('credit.movie_id IS NOT NULL')
      .getCount(),
    awards: await awardRepository.count(),
    linkedAwards: await awardRepository
      .createQueryBuilder('award')
      .where('award.movie_id IS NOT NULL')
      .getCount(),
  };
}
