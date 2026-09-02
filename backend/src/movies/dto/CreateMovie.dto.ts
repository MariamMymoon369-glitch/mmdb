import {
  IsString,
  IsInt,
  Min,
  Max,
  IsUrl,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsInt()
  @Min(1888)
  @Max(new Date().getFullYear() + 5)
  releaseYear: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  runtimeMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  overview?: string;

  @IsOptional()
  @IsUrl()
  posterUrl?: string;

  @IsOptional()
  @IsUrl()
  trailerUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  language?: string;
}
