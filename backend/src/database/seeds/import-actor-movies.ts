import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Movie } from '../../movies/movie.entity';
import { MovieCast } from '../../movies/movie-cast.entity';
import { Genre } from '../../genres/genre.entity';
import { MovieGenre } from '../../movies/movie-genre.entity';
import { PersonMovieCredit } from '../../people/person-movie-credit.entity';
import { Award } from '../../people/award.entity';
import { Person } from '../../people/person.entity';
import { PeopleService } from '../../people/people.service';
import { TmdbService } from '../../tmdb/tmdb.service';
import { WikidataService } from '../../wikidata/wikidata.service';

export interface ActorMovieCandidate {
  tmdbMovieId: number;
  title: string;
  releaseYear: number | null;
  localPeople: number;
  creditsWithPoster: number;
}

export interface ActorMovieImportOptions {
  target?: number;
  total?: number;
  concurrency?: number;
  buffer?: number;
  onProgress?: (message: string) => void;
}

export interface ActorMovieImportSummary {
  candidates: number;
  added: number;
  skippedExisting: number;
  skippedIncomplete: number;
  failed: number;
  linkedCredits: number;
  linkedAwards: number;
  addedCastRows: number;
}

interface TmdbMovieDetail {
  id: number;
  title: string;
  release_date: string | null;
  runtime: number | null;
  overview: string | null;
  poster_path: string | null;
  original_language: string | null;
  vote_average: number;
  genres?: { id: number; name: string }[];
  videos?: { results: { site: string; type: string; key: string }[] };
}

export function normalizeMovieTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function selectActorMovieCandidates(
  candidates: ActorMovieCandidate[],
  existingTitles: Set<string>,
  target: number,
): { selected: ActorMovieCandidate[]; skippedExisting: number } {
  const selected: ActorMovieCandidate[] = [];
  const seenTitles = new Set<string>();
  let skippedExisting = 0;

  const ranked = [...candidates].sort((a, b) => {
    if (a.localPeople !== b.localPeople) return b.localPeople - a.localPeople;
    if (a.creditsWithPoster !== b.creditsWithPoster) {
      return b.creditsWithPoster - a.creditsWithPoster;
    }
    return a.title.localeCompare(b.title);
  });

  for (const candidate of ranked) {
    const title = normalizeMovieTitle(candidate.title);
    if (existingTitles.has(title) || seenTitles.has(title)) {
      skippedExisting += 1;
      continue;
    }
    seenTitles.add(title);
    selected.push(candidate);
    if (selected.length >= target) {
      break;
    }
  }

  return { selected, skippedExisting };
}

export async function readActorMovieCandidates(
  dataSource: DataSource,
): Promise<ActorMovieCandidate[]> {
  const rows = (await dataSource.query(`
    SELECT c.tmdb_movie_id AS "tmdbMovieId",
           min(c.title) AS "title",
           min(c.release_year) AS "releaseYear",
           count(DISTINCT c.person_id)::int AS "localPeople",
           count(*) FILTER (WHERE c.poster_url IS NOT NULL)::int AS "creditsWithPoster"
    FROM person_movie_credits c
    GROUP BY c.tmdb_movie_id
    ORDER BY count(DISTINCT c.person_id) DESC,
             count(*) FILTER (WHERE c.poster_url IS NOT NULL) DESC,
             min(c.title) ASC
  `)) as unknown as ActorMovieCandidate[];

  return rows;
}

export async function syncMovieGenres(
  dataSource: DataSource,
  movies: { id: number; tmdbMovieId: number }[],
  tmdbService: TmdbService,
): Promise<number> {
  if (movies.length === 0) {
    return 0;
  }

  const genreRepository = dataSource.getRepository(Genre);
  const movieGenreRepository = dataSource.getRepository(MovieGenre);
  const genreCache = new Map<string, Genre>();

  let linked = 0;

  for (const movie of movies) {
    let detail: TmdbMovieDetail | null;
    try {
      detail = await tmdbService.fetchJson<TmdbMovieDetail>(
        `/movie/${movie.tmdbMovieId}?language=en-US`,
      );
    } catch {
      continue;
    }

    for (const genre of detail?.genres ?? []) {
      let localGenre = genreCache.get(genre.name);
      if (!localGenre) {
        localGenre =
          (await genreRepository.findOne({ where: { name: genre.name } })) ??
          undefined;
        if (!localGenre) {
          localGenre = await genreRepository.save(
            genreRepository.create({ name: genre.name }),
          );
        }
        genreCache.set(genre.name, localGenre);
      }

      const exists = await movieGenreRepository.findOne({
        where: { movieId: movie.id, genreId: localGenre.id },
      });
      if (!exists) {
        await movieGenreRepository.save(
          movieGenreRepository.create({
            movieId: movie.id,
            genreId: localGenre.id,
          }),
        );
        linked += 1;
      }
    }
  }

  return linked;
}

export async function syncCastFromCredits(
  dataSource: DataSource,
  movieIds: number[],
): Promise<number> {
  if (movieIds.length === 0) {
    return 0;
  }

  const castRepository = dataSource.getRepository(MovieCast);
  const creditRepository = dataSource.getRepository(PersonMovieCredit);

  const credits = await creditRepository
    .createQueryBuilder('credit')
    .where('credit.movie_id IN (:...ids)', { ids: movieIds })
    .getMany();

  const rows = credits.map((credit) => ({
    movieId: credit.movieId as number,
    personId: credit.personId,
    characterName: credit.characterName,
    billingOrder: credit.billingOrder,
  }));

  if (rows.length === 0) {
    return 0;
  }

  await castRepository.upsert(rows, ['movieId', 'personId', 'characterName']);
  return rows.length;
}

export async function importActorMovies(
  dataSource: DataSource,
  options: ActorMovieImportOptions = {},
): Promise<ActorMovieImportSummary> {
  const concurrency = options.concurrency ?? 5;
  const buffer = options.buffer ?? 25;
  const report = options.onProgress ?? (() => undefined);

  const movieRepository = dataSource.getRepository(Movie);
  const creditRepository = dataSource.getRepository(PersonMovieCredit);
  const tmdbService = new TmdbService(new ConfigService(process.env));

  const peopleService = new PeopleService(
    dataSource.getRepository(Person),
    creditRepository,
    dataSource.getRepository(Award),
    movieRepository,
    tmdbService,
    new WikidataService(),
  );

  const existingMovies = await movieRepository.find();
  const existingTitles = new Set(
    existingMovies.map((movie) => normalizeMovieTitle(movie.title)),
  );

  const target =
    options.total !== undefined
      ? Math.max(0, options.total - existingMovies.length)
      : (options.target ?? 195);

  const candidates = await readActorMovieCandidates(dataSource);
  report(
    `Films of the local actors: ${candidates.length}, local movies: ${existingMovies.length}, adding ${target}`,
  );

  const { selected, skippedExisting: skippedExistingCount } =
    selectActorMovieCandidates(candidates, existingTitles, target + buffer);
  let skippedExisting = skippedExistingCount;
  report(
    `Selected ${selected.length} films for the import (${skippedExisting} skipped, title already local)`,
  );

  const details = new Map<number, TmdbMovieDetail | null>();
  const queue = [...selected];
  const workers = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      while (queue.length > 0) {
        const candidate = queue.shift() as ActorMovieCandidate;
        try {
          details.set(
            candidate.tmdbMovieId,
            await tmdbService.fetchJson<TmdbMovieDetail>(
              `/movie/${candidate.tmdbMovieId}?language=en-US&append_to_response=videos`,
            ),
          );
        } catch {
          details.set(candidate.tmdbMovieId, null);
        }
      }
    },
  );
  await Promise.all(workers);

  let added = 0;
  let failed = 0;
  let skippedIncomplete = 0;
  const imported: { movie: Movie; tmdbMovieId: number }[] = [];

  for (const candidate of selected) {
    if (added >= target) {
      break;
    }

    const detail = details.get(candidate.tmdbMovieId);
    if (!detail) {
      failed += 1;
      continue;
    }

    const title = candidate.title.trim();
    const releaseYear = candidate.releaseYear;
    if (!title || releaseYear === null) {
      skippedIncomplete += 1;
      continue;
    }

    const normalized = normalizeMovieTitle(title);
    if (existingTitles.has(normalized)) {
      skippedExisting += 1;
      continue;
    }

    if (!detail.poster_path) {
      skippedIncomplete += 1;
      continue;
    }

    const trailer = (detail.videos?.results ?? []).find(
      (video) => video.site === 'YouTube' && video.type === 'Trailer',
    );

    const movie = movieRepository.create({
      title,
      releaseYear,
      runtimeMinutes:
        detail.runtime && detail.runtime > 0 ? detail.runtime : null,
      overview: detail.overview || null,
      posterUrl: tmdbService.imageUrl(detail.poster_path),
      trailerUrl: trailer
        ? `https://www.youtube.com/watch?v=${trailer.key}`
        : null,
      language: detail.original_language ?? null,
      rating: Number((detail.vote_average ?? 0).toFixed(1)),
      reviewCount: 0,
    });

    imported.push({
      movie: await movieRepository.save(movie),
      tmdbMovieId: candidate.tmdbMovieId,
    });
    existingTitles.add(normalized);
    added += 1;
  }

  report(
    `Imported ${added} movies (${failed} failed, ${skippedIncomplete} without usable data)`,
  );

  const linkedCredits = await peopleService.relinkCredits();
  report(`Linked ${linkedCredits} acting credits to local movies`);

  const linkedAwards = await peopleService.relinkAwards();
  report(`Linked ${linkedAwards} awards to local movies`);

  const importedIds = imported.map((entry) => entry.movie.id);
  const addedCastRows = await syncCastFromCredits(dataSource, importedIds);
  report(`Created ${addedCastRows} cast rows for the imported movies`);

  const addedGenreRows = await syncMovieGenres(
    dataSource,
    imported.map((entry) => ({
      id: entry.movie.id,
      tmdbMovieId: entry.tmdbMovieId,
    })),
    tmdbService,
  );
  report(`Linked ${addedGenreRows} genres to the imported movies`);

  return {
    candidates: candidates.length,
    added,
    skippedExisting,
    skippedIncomplete,
    failed,
    linkedCredits,
    linkedAwards,
    addedCastRows,
  };
}
