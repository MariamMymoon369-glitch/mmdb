import {
  calculateAge,
  extractReleaseYear,
  mapTmdbGender,
  mapTmdbPersonFields,
  normalizeTitle,
} from './person-details.mapper';
import { TmdbPersonDetail } from '../tmdb/tmdb.types';

describe('person details mapper', () => {
  describe('calculateAge', () => {
    const today = new Date(2026, 9, 20);

    it('returns the age when the birthday already passed this year', () => {
      expect(calculateAge('1956-07-09', null, today)).toBe(70);
    });

    it('subtracts a year when the birthday is still ahead', () => {
      expect(calculateAge('1956-12-09', null, today)).toBe(69);
    });

    it('counts the birthday of the current day', () => {
      expect(calculateAge('1956-10-20', null, today)).toBe(70);
    });

    it('handles the day before the birthday', () => {
      expect(calculateAge('1956-10-21', null, today)).toBe(69);
    });

    it('handles a leap day birthdate', () => {
      expect(calculateAge('2000-02-29', null, new Date(2026, 1, 28))).toBe(25);
    });

    it('returns null without a birthdate', () => {
      expect(calculateAge(null, null, today)).toBeNull();
    });

    it('returns null for an invalid birthdate', () => {
      expect(calculateAge('not-a-date', null, today)).toBeNull();
      expect(calculateAge('1956-13-45', null, today)).toBeNull();
    });

    it('calculates the age at death for a deceased person', () => {
      expect(calculateAge('1889-04-16', '1977-12-25', today)).toBe(88);
    });

    it('subtracts a year when the birthday after the death is still ahead', () => {
      expect(calculateAge('1889-04-16', '1977-04-15', today)).toBe(87);
    });

    it('ignores the current date for a deceased person', () => {
      expect(
        calculateAge('1889-04-16', '1977-12-25', new Date(2026, 9, 20)),
      ).toBe(88);
    });

    it('returns null when the death date is before the birth date', () => {
      expect(calculateAge('1977-12-25', '1889-04-16', today)).toBeNull();
    });

    it('returns null for an invalid death date', () => {
      expect(calculateAge('1889-04-16', 'not-a-date', today)).toBeNull();
    });

    it('does not present an implausible age for a living person', () => {
      expect(calculateAge('1889-04-16', null, today)).toBeNull();
    });

    it('does not present an age for a birthdate in the future', () => {
      expect(calculateAge('2030-01-01', null, today)).toBeNull();
    });
  });

  describe('mapTmdbGender', () => {
    it('maps the TMDB gender codes', () => {
      expect(mapTmdbGender(1)).toBe('Female');
      expect(mapTmdbGender(2)).toBe('Male');
      expect(mapTmdbGender(3)).toBe('Non-binary');
    });

    it('returns null for an unknown gender', () => {
      expect(mapTmdbGender(0)).toBeNull();
      expect(mapTmdbGender(null)).toBeNull();
    });
  });

  describe('extractReleaseYear', () => {
    it('extracts the year of a TMDB date', () => {
      expect(extractReleaseYear('1994-06-23')).toBe(1994);
    });

    it('returns null without a date', () => {
      expect(extractReleaseYear(null)).toBeNull();
      expect(extractReleaseYear('')).toBeNull();
    });
  });

  describe('normalizeTitle', () => {
    it('normalises case and whitespace', () => {
      expect(normalizeTitle('  The   Dark   Knight ')).toBe('the dark knight');
    });
  });

  describe('mapTmdbPersonFields', () => {
    const detail: TmdbPersonDetail = {
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
    };

    it('maps the personal information', () => {
      const fields = mapTmdbPersonFields(detail, (path) =>
        path ? `https://image.tmdb.org/t/p/w500${path}` : null,
      );

      expect(fields).toEqual({
        biography: 'A biography',
        gender: 'Male',
        birthdate: '1956-07-09',
        deathdate: null,
        placeOfBirth: 'Concord, California, USA',
        knownFor: 'Acting',
        photoUrl: 'https://image.tmdb.org/t/p/w500/photo.jpg',
        imdbId: 'nm0000158',
      });
    });

    it('maps the date of death of a deceased person', () => {
      const fields = mapTmdbPersonFields(
        { ...detail, deathday: '1977-12-25' },
        (path) => (path ? `https://image.tmdb.org/t/p/w500${path}` : null),
      );

      expect(fields.deathdate).toBe('1977-12-25');
    });

    it('keeps missing values as null instead of inventing them', () => {
      const fields = mapTmdbPersonFields(
        {
          ...detail,
          biography: null,
          birthday: null,
          place_of_birth: null,
          known_for_department: null,
          gender: 0,
          imdb_id: null,
        },
        () => null,
      );

      expect(fields.biography).toBeNull();
      expect(fields.birthdate).toBeNull();
      expect(fields.deathdate).toBeNull();
      expect(fields.placeOfBirth).toBeNull();
      expect(fields.knownFor).toBeNull();
      expect(fields.gender).toBeNull();
      expect(fields.imdbId).toBeNull();
    });
  });
});
