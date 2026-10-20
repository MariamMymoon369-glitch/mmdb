export class ActingCreditDto {
  title: string;
  characterName: string;
  releaseYear: number | null;
  posterUrl: string | null;
  movieUuid: string | null;
}

export class AwardEntryDto {
  year: number | null;
  status: string;
  awardName: string;
  awardCategory: string | null;
  associatedMovieTitle: string | null;
  associatedMovieYear: number | null;
  movieUuid: string | null;
  posterUrl: string | null;
}

export class PersonDetailsDto {
  uuid: string;
  name: string;
  photoUrl: string | null;
  biography: string | null;
  gender: string | null;
  birthdate: string | null;
  deathdate: string | null;
  age: number | null;
  placeOfBirth: string | null;
  knownFor: string | null;
  acting: ActingCreditDto[];
  awards: AwardEntryDto[];
}
