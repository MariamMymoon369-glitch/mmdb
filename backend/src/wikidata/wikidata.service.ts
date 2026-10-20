import { Injectable, Logger } from '@nestjs/common';
import { AwardResult, WikidataAward } from './wikidata.types';
import { deriveAwardCategory, deriveAwardName } from './award-label';

const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ROWS = 2000;
const BATCH_SIZE = 25;

export class WikidataRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WikidataRequestError';
  }
}

interface SparqlBinding {
  imdb?: { value: string };
  sourceId?: { value: string };
  awardLabel?: { value: string };
  year?: { value: string };
  categoryLabel?: { value: string };
  workLabel?: { value: string };
  workYear?: { value: string };
  workTmdb?: { value: string };
}

@Injectable()
export class WikidataService {
  private readonly logger = new Logger(WikidataService.name);

  async getAwards(imdbId: string): Promise<WikidataAward[]> {
    const awards = await this.getAwardsForPeople([imdbId]);
    return awards.get(imdbId) ?? [];
  }

  async getAwardsForPeople(
    imdbIds: string[],
    options: { continueOnError?: boolean } = {},
  ): Promise<Map<string, WikidataAward[]>> {
    const result = new Map<string, WikidataAward[]>();
    const ids = [...new Set(imdbIds.filter((id) => Boolean(id)))];
    if (ids.length === 0) {
      return result;
    }

    for (const chunk of this.chunk(ids, BATCH_SIZE)) {
      let winnerRows: SparqlBinding[] = [];
      let nominatedRows: SparqlBinding[] = [];

      try {
        [winnerRows, nominatedRows] = await Promise.all([
          this.runQuery(this.buildQuery(chunk, 'p:P166', 'ps:P166')),
          this.runQuery(this.buildQuery(chunk, 'p:P1411', 'ps:P1411')),
        ]);
      } catch (error) {
        if (!options.continueOnError) {
          throw error;
        }
        this.logger.warn(
          `Wikidata batch request failed: ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        );
        continue;
      }

      const seen = new Set<string>();
      const collect = (rows: SparqlBinding[], awardResult: AwardResult) => {
        for (const row of rows) {
          const label = row.awardLabel?.value;
          const sourceId = row.sourceId?.value;
          const imdbId = row.imdb?.value;
          if (!label || !sourceId || !imdbId) continue;
          if (seen.has(sourceId)) continue;
          seen.add(sourceId);

          const bucket = result.get(imdbId) ?? [];
          bucket.push({
            sourceId,
            label,
            awardName: deriveAwardName(label),
            category: this.resolveCategory(label, row.categoryLabel?.value),
            year: this.toInteger(row.year?.value),
            result: awardResult,
            workTitle: this.resolveWorkTitle(row.workLabel?.value),
            workYear: this.toInteger(row.workYear?.value),
            workTmdbId: this.toInteger(row.workTmdb?.value),
          });
          result.set(imdbId, bucket);
        }
      };

      collect(winnerRows, 'Winner');
      collect(nominatedRows, 'Nominated');
    }

    return result;
  }

  private buildQuery(
    imdbIds: string[],
    statementProperty: string,
    valueProperty: string,
  ): string {
    const values = imdbIds.map((id) => `"${id}"`).join(' ');

    return `
      SELECT ?imdb ?sourceId ?awardLabel ?year ?categoryLabel ?workLabel ?workYear ?workTmdb WHERE {
        VALUES ?imdb { ${values} }
        ?item wdt:P345 ?imdb .
        ?item ${statementProperty} ?statement .
        ?statement ${valueProperty} ?award .
        ?statement wikibase:rank ?rank .
        FILTER(?rank != wikibase:DeprecatedRank)
        OPTIONAL { ?statement pq:P585 ?date . BIND(YEAR(?date) AS ?year) }
        OPTIONAL { ?statement pq:P1344 ?category . }
        OPTIONAL {
          ?statement pq:P1686 ?work .
          OPTIONAL { ?work wdt:P577 ?releaseDate . BIND(YEAR(?releaseDate) AS ?workYear) }
          OPTIONAL { ?work wdt:P4947 ?workTmdb }
        }
        BIND(REPLACE(STR(?statement), "^.*/", "") AS ?sourceId)
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT ${MAX_ROWS}
    `;
  }

  private async runQuery(query: string): Promise<SparqlBinding[]> {
    const url = `${WIKIDATA_SPARQL_ENDPOINT}?format=json&query=${encodeURIComponent(query)}`;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          accept: 'application/sparql-results+json',
          'user-agent': 'MMDB-actor-details/1.0 (open source project)',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      throw new WikidataRequestError(
        `Wikidata request failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }

    if (!response.ok) {
      throw new WikidataRequestError(
        `Wikidata responded with status ${response.status}`,
      );
    }

    const payload = (await response.json()) as {
      results?: { bindings?: SparqlBinding[] };
    };
    return payload.results?.bindings ?? [];
  }

  private resolveCategory(
    label: string,
    qualifier: string | undefined,
  ): string | null {
    if (qualifier) return qualifier;
    return deriveAwardCategory(label);
  }

  private resolveWorkTitle(label: string | undefined): string | null {
    if (!label) return null;
    if (/^Q\d+$/i.test(label.trim())) return null;
    return label;
  }

  private toInteger(value: string | undefined): number | null {
    if (value === undefined) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private chunk(values: string[], size: number): string[][] {
    const chunks: string[][] = [];
    for (let index = 0; index < values.length; index += size) {
      chunks.push(values.slice(index, index + size));
    }
    return chunks;
  }
}
