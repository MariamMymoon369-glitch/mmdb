import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(10)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  body?: string;

  @IsInt()
  movieId: number;
}
