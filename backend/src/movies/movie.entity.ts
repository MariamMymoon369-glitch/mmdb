import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Review } from '../reviews/review.entity';

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
  runtimeMinutes?: number | null;

  @Column({ type: 'text', nullable: true })
  overview?: string | null;

  @Column({ type: 'text', nullable: true, name: 'poster_url' })
  posterUrl?: string | null;

  @Column({ type: 'text', nullable: true, name: 'trailer_url' })
  trailerUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  language?: string | null;
  // database change
  @Column({ type: 'numeric', precision: 3, scale: 1, default: 0 })
  rating!: number;

  @Column({ type: 'integer', name: 'review_count', default: 0 })
  reviewCount!: number;

  @OneToMany(() => Review, (review) => review.movieId)
  reviews!: Review[];
}
