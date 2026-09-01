import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { Movie } from '../movies/movie.entity';
import { User } from '../users/user.entity';

@Entity('reviews')
@Check(`"rating" >= 1 AND "rating" <= 10`)
export class Review {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    type: 'uuid',
    unique: true,
    nullable: false,
    default: () => 'gen_random_uuid()',
  })
  uuid?: string;

  @Column({ type: 'integer', nullable: false })
  rating?: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  body?: string | null;
  @Column({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt?: Date;

  @ManyToOne(() => Movie, (movie) => movie.reviews, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'movie_id' })
  movie?: Movie;

  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_uuid' })
  user?: User;
}
