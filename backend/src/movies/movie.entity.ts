import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Review } from '../reviews/review.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'uuid',
    unique: true,
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  uuid: string;

  @Column({ type: 'varchar', nullable: false, length: 255 })
  title: string;

  @Column({ type: 'integer', name: 'release_year', nullable: false })
  releaseYear: number;

  @Column({ type: 'integer', nullable: true, name: 'runtime_minutes' })
  runtimeMinutes: number | null;

  @Column({ type: 'text', nullable: true })
  overview: string | null;

  @Column({ type: 'varchar', nullable: true, length: 500, name: 'poster_url' })
  posterUrl: string | null;

  @Column({ type: 'varchar', nullable: true, length: 500, name: 'trailer_url' })
  trailerUrl: string | null;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  language: string | null;
  // database change
  @Column({ type: 'numeric', precision: 3, scale: 1, default: 0 })
  rating: number;

  @Column({ type: 'integer', name: 'review_count', default: 0 })
  reviewCount: number;

  @OneToMany(() => Review, (review) => review.movie)
  reviews: Review[];
}
