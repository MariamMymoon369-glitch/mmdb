export type AwardResult = 'Winner' | 'Nominated';

export interface WikidataAward {
  sourceId: string;
  label: string;
  awardName: string;
  category: string | null;
  year: number | null;
  result: AwardResult;
  workTitle: string | null;
  workYear: number | null;
  workTmdbId: number | null;
}
