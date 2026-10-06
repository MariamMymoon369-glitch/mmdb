import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Movie } from './movie.entity';
import { Person } from '../people/person.entity';

@Entity('movie_cast')
export class MovieCast {
  @PrimaryColumn({ type: 'integer', name: 'movie_id' })
  movieId: number;

  @PrimaryColumn({ type: 'integer', name: 'person_id' })
  personId: number;

  @PrimaryColumn({
    type: 'varchar',
    length: 255,
    name: 'character_name',
  })
  characterName: string;

  @Column({ type: 'integer', nullable: true, name: 'billing_order' })
  billingOrder: number | null;

  @ManyToOne(() => Movie, (movie) => movie.cast, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Person, (person) => person.cast, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;
}
