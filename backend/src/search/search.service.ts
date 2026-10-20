import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../movies/movie.entity';
import { Person } from '../people/person.entity';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto } from './dto/search-response.dto';

const DEFAULT_LIMIT = 5;

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async search(query: SearchQueryDto): Promise<SearchResponseDto> {
    const term = (query.q ?? '').trim();

    if (term.length === 0) {
      return { query: term, movies: [], people: [] };
    }

    const limit = query.limit ?? DEFAULT_LIMIT;

    const [movies, people] = await Promise.all([
      this.findMovies(term, limit),
      this.findPeople(term, limit),
    ]);

    return { query: term, movies, people };
  }

  private async findMovies(term: string, limit: number) {
    const movies = await this.movieRepository
      .createQueryBuilder('movie')
      .where(`movie.title ILIKE :pattern ESCAPE '\\'`, {
        pattern: this.buildPattern(term),
      })
      .orderBy(`CASE WHEN lower(movie.title) = :exact THEN 0 ELSE 1 END`, 'ASC')
      .addOrderBy(
        `CASE WHEN lower(movie.title) LIKE :prefix ESCAPE '\\' THEN 0 ELSE 1 END`,
        'ASC',
      )
      .addOrderBy('length(movie.title)', 'ASC')
      .addOrderBy('movie.rating', 'DESC')
      .setParameter('exact', term.toLowerCase())
      .setParameter('prefix', `${this.escapeLike(term).toLowerCase()}%`)
      .take(limit)
      .getMany();

    return movies.map((movie) => ({
      uuid: movie.uuid,
      title: movie.title,
      releaseYear: movie.releaseYear,
      posterUrl: movie.posterUrl,
      rating: movie.rating,
      reviewCount: movie.reviewCount,
    }));
  }

  private async findPeople(term: string, limit: number) {
    const people = await this.personRepository
      .createQueryBuilder('person')
      .where(`person.name ILIKE :pattern ESCAPE '\\'`, {
        pattern: this.buildPattern(term),
      })
      .orderBy(`CASE WHEN lower(person.name) = :exact THEN 0 ELSE 1 END`, 'ASC')
      .addOrderBy(
        `CASE WHEN lower(person.name) LIKE :prefix ESCAPE '\\' THEN 0 ELSE 1 END`,
        'ASC',
      )
      .addOrderBy('length(person.name)', 'ASC')
      .addOrderBy('person.name', 'ASC')
      .setParameter('exact', term.toLowerCase())
      .setParameter('prefix', `${this.escapeLike(term).toLowerCase()}%`)
      .take(limit)
      .getMany();

    return people.map((person) => ({
      uuid: person.uuid,
      name: person.name,
      photoUrl: person.photoUrl,
    }));
  }

  private buildPattern(term: string): string {
    return `%${this.escapeLike(term)}%`;
  }

  /** Escapes the wildcards of the LIKE operator so they match literally. */
  private escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, (character) => `\\${character}`);
  }
}
