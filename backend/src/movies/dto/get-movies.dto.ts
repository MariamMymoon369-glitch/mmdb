/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMoviesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 8;

  @IsOptional()
  @IsIn(['newest', 'oldest'] as const)
  sort?: 'newest' | 'oldest' = 'newest';
}
