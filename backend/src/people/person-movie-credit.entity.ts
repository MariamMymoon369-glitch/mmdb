import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from './person.entity';

@Entity('person_movie_credits')
export class PersonMovieCredit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', name: 'person_id' })
  personId: number;

  @Column({ type: 'integer', name: 'movie_id', nullable: true })
  movieId: number | null;

  @Column({ type: 'integer', name: 'tmdb_movie_id' })
  tmdbMovieId: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'integer', name: 'release_year', nullable: true })
  releaseYear: number | null;

  @Column({ type: 'varchar', length: 255, name: 'character_name' })
  characterName: string;

  @Column({ type: 'varchar', length: 500, name: 'poster_url', nullable: true })
  posterUrl: string | null;

  @Column({ type: 'integer', name: 'billing_order', nullable: true })
  billingOrder: number | null;

  @Column({ type: 'varchar', length: 32, default: 'tmdb' })
  source: string;

  @Column({ type: 'varchar', length: 255, name: 'source_id', nullable: true })
  sourceId: string | null;

  @ManyToOne(() => Person, (person) => person.movieCredits, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;
}
