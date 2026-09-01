import { IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum MovieSortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export class GetMoviesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 8;

  @IsOptional()
  @IsEnum(MovieSortOption)
  sort: MovieSortOption = MovieSortOption.NEWEST;
}
