import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MovieCast } from '../movies/movie-cast.entity';
import { MovieCrew } from '../movies/movie-crew.entity';

@Entity('people')
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'uuid',
    unique: true,
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  uuid: string;

  @Column({
    type: 'integer',
    name: 'tmdb_id',
    unique: true,
    nullable: true,
  })
  tmdbId: number | null;

  @Column({ type: 'varchar', nullable: false, length: 255 })
  name: string;

  @Column({ type: 'varchar', nullable: true, length: 500, name: 'photo_url' })
  photoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  biography: string | null;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  gender: string | null;

  @Column({ type: 'date', nullable: true })
  birthdate: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 255,
    name: 'place_of_birth',
  })
  placeOfBirth: string | null;

  @Column({ type: 'varchar', nullable: true, length: 255, name: 'known_for' })
  knownFor: string | null;

  @OneToMany(() => MovieCast, (cast) => cast.person)
  cast: MovieCast[];

  @OneToMany(() => MovieCrew, (crew) => crew.person)
  crew: MovieCrew[];
}
