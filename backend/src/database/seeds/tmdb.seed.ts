import 'dotenv/config';
import dataSource from '../data-source';
import { Movie } from '../../movies/movie.entity';
import { User } from '../../users/user.entity';
import { Review } from '../../reviews/review.entity';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

interface TmdbListItem {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  original_language: string;
  poster_path: string | null;
}

interface TmdbDetail {
  runtime: number | null;
  poster_path: string | null;
  videos?: { results: { site: string; type: string; key: string }[] };
}

function tmdbFetch(path: string): Promise<unknown> {
  const token = process.env.TMDB_READ_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) {
    throw new Error(
      'Set TMDB_READ_TOKEN (v4) or TMDB_API_KEY (v3) in backend/.env',
    );
  }
  const url = token
    ? `${TMDB_BASE}${path}`
    : `${TMDB_BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${apiKey}`;
  return fetch(url, {
    headers: {
      accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(async (res) => {
    if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`);
    return res.json() as Promise<unknown>;
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Deterministic PRNG so re-runs produce the same reviews.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED_USERS = [
  ['Amara', 'Okafor', 'amara.o'],
  ['Liam', 'Bennett', 'liam.b'],
  ['Sofia', 'Marsh', 'sofia.m'],
  ['Kenji', 'Tanaka', 'kenji.t'],
  ['Priya', 'Nair', 'priya.n'],
  ['Diego', 'Fuentes', 'diego.f'],
  ['Nora', 'Haddad', 'nora.h'],
  ['Felix', 'Gruber', 'felix.g'],
  ['Zainab', 'Bello', 'zainab.b'],
  ['Marco', 'Rossi', 'marco.r'],
  ['Ingrid', 'Larsen', 'ingrid.l'],
  ['Tunde', 'Adeyemi', 'tunde.a'],
] as const;

const REVIEW_BODIES = [
  'A masterclass in pacing. The final act had me holding my breath.',
  'Great performances all around, though the middle dragged a little.',
  'The cinematography alone is worth the watch.',
  'Went in with low expectations and was completely won over.',
  'A solid film. Not perfect, but highly rewatchable.',
  'The score elevates every single scene.',
  'Some bold choices that mostly pay off.',
  'I think about the ending at least once a week.',
  'Fun crowd-pleaser, perfect for a Friday night.',
  'Beautifully shot, and the lead carries the whole thing.',
  'Overhyped for me, but I can see why people love it.',
  'Tight script, zero wasted scenes.',
  'The practical effects hold up incredibly well.',
  'Watched it twice in one weekend. No regrets.',
];

async function main() {
  await dataSource.initialize();
  const moviesRepo = dataSource.getRepository(Movie);
  const usersRepo = dataSource.getRepository(User);
  const reviewsRepo = dataSource.getRepository(Review);

  // --- 1. Fetch 100 movies from TMDB top rated ---
  const listed = new Map<number, TmdbListItem>();
  for (let page = 1; page <= 5; page++) {
    const data = (await tmdbFetch(
      `/movie/top_rated?language=en-US&page=${page}`,
    )) as { results: TmdbListItem[] };
    for (const m of data.results) listed.set(m.id, m);
  }
  console.log(`Fetched ${listed.size} movies from TMDB list endpoint`);

  // --- 2. Details (runtime + trailer) per movie ---
  let movieInserted = 0;
  let movieSkipped = 0;
  const allMovies: Movie[] = await moviesRepo.find();
  for (const item of listed.values()) {
    const year = Number((item.release_date ?? '').slice(0, 4));
    if (!item.title || !year) continue;
    const exists = allMovies.some(
      (m) => m.title === item.title && m.releaseYear === year,
    );
    if (exists) {
      movieSkipped++;
      continue;
    }
    let detail: TmdbDetail | null = null;
    try {
      detail = (await tmdbFetch(
        `/movie/${item.id}?language=en-US&append_to_response=videos`,
      )) as TmdbDetail;
    } catch (err) {
      console.log(`Detail fetch failed for ${item.title}:`, err);
      console.warn(`Detail failed for ${item.title}, using list data`);
    }
    await sleep(200); // stay under TMDB rate limits
    const trailerKey =
      detail?.videos?.results.find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer',
      )?.key ?? detail?.videos?.results.find((v) => v.site === 'YouTube')?.key;
    const posterPath = detail?.poster_path ?? item.poster_path;
    const movie = moviesRepo.create({
      title: item.title,
      releaseYear: year,
      runtimeMinutes: detail?.runtime ?? null,
      overview: item.overview || null,
      posterUrl: posterPath ? `${POSTER_BASE}${posterPath}` : null,
      trailerUrl: trailerKey
        ? `https://www.youtube.com/watch?v=${trailerKey}`
        : null,
      language: item.original_language ?? null,
      rating: Number(item.vote_average.toFixed(1)),
      reviewCount: 0,
    });
    const saved = await moviesRepo.save(movie);
    allMovies.push(saved);
    movieInserted++;
  }
  console.log(`Movies inserted: ${movieInserted}, skipped: ${movieSkipped}`);

  // --- 3. Users (password hashed by entity hook) ---
  const allUsers: User[] = await usersRepo.find();
  for (const [first, last, handle] of SEED_USERS) {
    const email = `${handle}@mmdb.local`;
    if (allUsers.some((u) => u.email === email)) continue;
    const user = usersRepo.create({
      firstName: first,
      lastName: last,
      email,
      displayName: handle,
      passwordHash: 'mmdb-demo-1234',
      profilePictureUrl: `https://ui-avatars.com/api/?name=${first}+${last}&background=random`,
    });
    allUsers.push(await usersRepo.save(user));
  }
  console.log(`Users total: ${allUsers.length}`);

  // --- 4. Reviews (deterministic) ---
  const rand = mulberry32(42);
  let reviewInserted = 0;
  for (const user of allUsers) {
    const shuffled = [...allMovies].sort(() => rand() - 0.5);
    const count = 18 + Math.floor(rand() * 9); // 18-26 reviews per user
    for (const movie of shuffled.slice(0, count)) {
      const dupe = await reviewsRepo.findOne({
        where: { movie: { id: movie.id }, user: { id: user.id } },
      });
      if (dupe) continue;
      const rating = Math.min(
        10,
        Math.max(1, Math.round(6.5 + (rand() + rand() + rand() - 1.5) * 3)),
      );
      const review = reviewsRepo.create({
        rating,
        body:
          rand() < 0.25
            ? null
            : REVIEW_BODIES[Math.floor(rand() * REVIEW_BODIES.length)],
        movie,
        user,
      });
      await reviewsRepo.save(review);
      reviewInserted++;
    }
  }
  console.log(`Reviews inserted: ${reviewInserted}`);

  // --- 5. Recompute aggregates + fix sequences ---
  for (const movie of allMovies) {
    const reviews = await reviewsRepo.find({
      where: { movie: { id: movie.id } },
    });
    if (reviews.length > 0) {
      movie.reviewCount = reviews.length;
      movie.rating = Number(
        (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
      );
      await moviesRepo.save(movie);
    }
  }
  for (const [table, seq] of [
    ['movies', 'movies_id_seq'],
    ['users', 'users_id_seq'],
    ['reviews', 'reviews_id_seq'],
  ]) {
    await dataSource.query(
      `SELECT setval('${seq}', (SELECT max("id") FROM "${table}"))`,
    );
  }
  console.log('Aggregates recomputed, sequences fixed. Done.');
}

main()
  .catch((err: unknown) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    if (dataSource.isInitialized) return dataSource.destroy();
  });
