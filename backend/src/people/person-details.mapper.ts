import { TmdbPersonDetail } from '../tmdb/tmdb.types';

const MAX_PLAUSIBLE_AGE = 122;

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function parseDate(value: string | null | undefined): DateParts | null {
  if (!value) return null;

  const parts = value.split('-').map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  const [year, month, day] = parts as [number, number, number];
  if (year <= 0 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return { year, month, day };
}

function yearsBetween(from: DateParts, to: DateParts): number {
  let age = to.year - from.year;
  const monthDifference = to.month - from.month;
  if (monthDifference < 0 || (monthDifference === 0 && to.day < from.day)) {
    age -= 1;
  }
  return age;
}

export function calculateAge(
  birthdate: string | null,
  deathdate: string | null = null,
  today: Date = new Date(),
): number | null {
  const birth = parseDate(birthdate);
  if (!birth) {
    return null;
  }

  const death = parseDate(deathdate);
  if (death) {
    if (death.year < birth.year) {
      return null;
    }
    const age = yearsBetween(birth, death);
    return age >= 0 && age <= MAX_PLAUSIBLE_AGE ? age : null;
  }

  const now: DateParts = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
  if (now.year < birth.year) {
    return null;
  }

  const age = yearsBetween(birth, now);
  return age >= 0 && age <= MAX_PLAUSIBLE_AGE ? age : null;
}

export function mapTmdbGender(
  gender: number | null | undefined,
): string | null {
  switch (gender) {
    case 1:
      return 'Female';
    case 2:
      return 'Male';
    case 3:
      return 'Non-binary';
    default:
      return null;
  }
}

export function extractReleaseYear(
  releaseDate: string | null | undefined,
): number | null {
  if (!releaseDate) return null;
  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

export function normalizeTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ').toLowerCase();
}

export interface PersonDetailFields {
  biography: string | null;
  gender: string | null;
  birthdate: string | null;
  deathdate: string | null;
  placeOfBirth: string | null;
  knownFor: string | null;
  photoUrl: string | null;
  imdbId: string | null;
}

export function mapTmdbPersonFields(
  detail: TmdbPersonDetail,
  imageUrl: (path: string | null) => string | null,
): PersonDetailFields {
  return {
    biography: detail.biography || null,
    gender: mapTmdbGender(detail.gender),
    birthdate: detail.birthday || null,
    deathdate: detail.deathday || null,
    placeOfBirth: detail.place_of_birth || null,
    knownFor: detail.known_for_department || null,
    photoUrl: imageUrl(detail.profile_path),
    imdbId: detail.imdb_id || null,
  };
}
