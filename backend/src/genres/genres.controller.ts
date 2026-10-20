import { Controller, Get } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenreResponseDto } from './dto/genre-response.dto';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  findAll(): Promise<GenreResponseDto[]> {
    return this.genresService.findAll();
  }
}
