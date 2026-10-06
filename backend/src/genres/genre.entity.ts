import { Entity, OneToMany, PrimaryGeneratedColumn, Column } from 'typeorm';
import { MovieGenre } from '../movies/movie-genre.entity';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, unique: true, length: 100 })
  name: string;

  @OneToMany(() => MovieGenre, (movieGenre) => movieGenre.genre)
  movieGenres: MovieGenre[];
}
