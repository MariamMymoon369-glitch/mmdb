import {
  ActorMovieCandidate,
  normalizeMovieTitle,
  selectActorMovieCandidates,
} from './import-actor-movies';

describe('actor movie import', () => {
  const candidate = (
    overrides: Partial<ActorMovieCandidate> = {},
  ): ActorMovieCandidate => ({
    tmdbMovieId: 1,
    title: 'A Movie',
    releaseYear: 2000,
    localPeople: 1,
    creditsWithPoster: 1,
    ...overrides,
  });

  describe('normalizeMovieTitle', () => {
    it('normalises case and whitespace', () => {
      expect(normalizeMovieTitle('  The   Dark   Knight ')).toBe(
        'the dark knight',
      );
    });
  });

  describe('selectActorMovieCandidates', () => {
    it('prefers the films with the most local actors', () => {
      const candidates = [
        candidate({ tmdbMovieId: 1, title: 'One Actor', localPeople: 1 }),
        candidate({ tmdbMovieId: 2, title: 'Many Actors', localPeople: 12 }),
        candidate({ tmdbMovieId: 3, title: 'Some Actors', localPeople: 5 }),
      ];

      const { selected } = selectActorMovieCandidates(candidates, new Set(), 2);

      expect(selected.map((entry) => entry.title)).toEqual([
        'Many Actors',
        'Some Actors',
      ]);
    });

    it('counts a film only once', () => {
      const candidates = [
        candidate({ tmdbMovieId: 1, title: 'Same Film', localPeople: 9 }),
        candidate({ tmdbMovieId: 2, title: 'Same Film', localPeople: 8 }),
      ];

      const { selected, skippedExisting } = selectActorMovieCandidates(
        candidates,
        new Set(),
        5,
      );

      expect(selected).toHaveLength(1);
      expect(skippedExisting).toBe(1);
    });

    it('skips films whose title is already in the local database', () => {
      const candidates = [
        candidate({ tmdbMovieId: 1, title: 'Existing Movie', localPeople: 9 }),
        candidate({ tmdbMovieId: 2, title: 'New Movie', localPeople: 8 }),
      ];

      const { selected, skippedExisting } = selectActorMovieCandidates(
        candidates,
        new Set(['existing movie']),
        5,
      );

      expect(selected.map((entry) => entry.title)).toEqual(['New Movie']);
      expect(skippedExisting).toBe(1);
    });

    it('respects the target size', () => {
      const candidates = [
        candidate({ tmdbMovieId: 1, title: 'A', localPeople: 3 }),
        candidate({ tmdbMovieId: 2, title: 'B', localPeople: 2 }),
        candidate({ tmdbMovieId: 3, title: 'C', localPeople: 1 }),
      ];

      const { selected } = selectActorMovieCandidates(candidates, new Set(), 2);

      expect(selected).toHaveLength(2);
    });
  });
});
