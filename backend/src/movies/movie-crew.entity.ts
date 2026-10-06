import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Movie } from './movie.entity';
import { Person } from '../people/person.entity';

@Entity('movie_crew')
export class MovieCrew {
  @PrimaryColumn({ type: 'integer', name: 'movie_id' })
  movieId: number;

  @PrimaryColumn({ type: 'integer', name: 'person_id' })
  personId: number;

  @PrimaryColumn({ type: 'varchar', length: 50 })
  job: string;

  @ManyToOne(() => Movie, (movie) => movie.crew, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Person, (person) => person.crew, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;
}
