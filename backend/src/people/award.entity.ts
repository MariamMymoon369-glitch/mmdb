import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from './person.entity';

@Entity('awards')
export class Award {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', name: 'person_id' })
  personId: number;

  @Column({ type: 'integer', name: 'movie_id', nullable: true })
  movieId: number | null;

  @Column({ type: 'integer', nullable: true })
  year: number | null;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  @Column({ type: 'text', nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  result: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'associated_movie_title',
    nullable: true,
  })
  associatedMovieTitle: string | null;

  @Column({
    type: 'integer',
    name: 'associated_movie_year',
    nullable: true,
  })
  associatedMovieYear: number | null;

  @Column({
    type: 'integer',
    name: 'associated_tmdb_movie_id',
    nullable: true,
  })
  associatedTmdbMovieId: number | null;

  @Column({ type: 'varchar', length: 500, name: 'poster_url', nullable: true })
  posterUrl: string | null;

  @Column({ type: 'varchar', length: 32, default: 'wikidata' })
  source: string;

  @Column({ type: 'varchar', length: 255, name: 'source_id', nullable: true })
  sourceId: string | null;

  @ManyToOne(() => Person, (person) => person.awards, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;
}
