import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()',
  })
  uuid!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'integer', name: 'release_year' })
  releaseYear!: number;

  @Column({ type: 'integer', nullable: true, name: 'runtime_minutes' })
  runtimeMinutes: number | null = null;

  @Column({ type: 'text', nullable: true })
  overview: string | null = null;

  @Column({ type: 'text', nullable: true, name: 'poster_url' })
  posterUrl: string | null = null;

  @Column({ type: 'text', nullable: true, name: 'trailer_url' })
  trailerUrl: string | null = null;

  @Column({ type: 'text', nullable: true })
  language: string | null = null;
}
