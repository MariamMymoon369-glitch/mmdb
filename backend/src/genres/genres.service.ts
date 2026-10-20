import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';
import { GenreResponseDto } from './dto/genre-response.dto';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async findAll(): Promise<GenreResponseDto[]> {
    const genres = await this.genreRepository.find({
      order: { name: 'ASC' },
    });

    return genres.map((genre) => ({ id: genre.id, name: genre.name }));
  }
}
