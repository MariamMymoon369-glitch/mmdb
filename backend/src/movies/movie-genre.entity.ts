import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Movie } from './movie.entity';
import { Genre } from '../genres/genre.entity';

@Entity('movie_genres')
export class MovieGenre {
  @PrimaryColumn({ type: 'integer', name: 'movie_id' })
  movieId: number;

  @PrimaryColumn({ type: 'integer', name: 'genre_id' })
  genreId: number;

  @ManyToOne(() => Movie, (movie) => movie.genres, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @ManyToOne(() => Genre, (genre) => genre.movieGenres, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'genre_id' })
  genre: Genre;
}
