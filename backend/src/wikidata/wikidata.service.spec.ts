import { WikidataService } from './wikidata.service';

describe('WikidataService', () => {
  let service: WikidataService;

  const sparqlResponse = (bindings: unknown[]) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ results: { bindings } }),
  });

  const binding = (value: Record<string, string>) =>
    Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, { value: entry }]),
    );

  beforeEach(() => {
    service = new WikidataService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps awards and nominations of a person', async () => {
    const fetchMock = jest.fn().mockImplementation((url: string) => {
      if (url.includes('P166')) {
        return Promise.resolve(
          sparqlResponse([
            binding({
              imdb: 'nm0000158',
              sourceId: 'Q2263-1',
              awardLabel: 'Academy Award for Best Actor',
              year: '1995',
              workLabel: 'Forrest Gump',
              workYear: '1994',
              workTmdb: '13',
            }),
          ]),
        );
      }
      return Promise.resolve(
        sparqlResponse([
          binding({
            imdb: 'nm0000158',
            sourceId: 'Q2263-2',
            awardLabel: 'Academy Award for Best Actor',
            year: '1994',
          }),
        ]),
      );
    });
    global.fetch = fetchMock;

    const awards = await service.getAwards('nm0000158');

    expect(awards).toHaveLength(2);
    expect(awards[0]).toMatchObject({
      sourceId: 'Q2263-1',
      awardName: 'Academy Award',
      category: 'Best Actor',
      year: 1995,
      result: 'Winner',
      workTitle: 'Forrest Gump',
      workYear: 1994,
      workTmdbId: 13,
    });
    expect(awards[1]).toMatchObject({
      sourceId: 'Q2263-2',
      result: 'Nominated',
      year: 1994,
      workTitle: null,
    });
  });

  it('ignores work items without a readable label', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      sparqlResponse([
        binding({
          imdb: 'nm0000158',
          sourceId: 'Q2263-3',
          awardLabel: 'Academy Award for Best Actor',
          year: '1995',
          workLabel: 'Q134773',
          workYear: '1994',
          workTmdb: '13',
        }),
      ]),
    );
    global.fetch = fetchMock;

    const awards = await service.getAwards('nm0000158');

    expect(awards[0].workTitle).toBeNull();
    expect(awards[0].workTmdbId).toBe(13);
  });

  it('returns an empty list when the person has no Wikidata entry', async () => {
    global.fetch = jest.fn().mockResolvedValue(sparqlResponse([]));

    await expect(service.getAwards('nm9999999')).resolves.toEqual([]);
  });

  it('raises an error when the query service is unavailable', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    });

    await expect(service.getAwards('nm0000158')).rejects.toThrow(
      /Wikidata responded with status 503/,
    );
  });
});
