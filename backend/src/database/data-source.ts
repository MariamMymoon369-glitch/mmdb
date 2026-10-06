import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Movie } from '../movies/movie.entity';
import { User } from '../users/user.entity';
import { Review } from '../reviews/review.entity';
import { RevokedToken } from '../auth/revoked-token.entity';
import { Person } from '../people/person.entity';
import { MovieCast } from '../movies/movie-cast.entity';
import { MovieCrew } from '../movies/movie-crew.entity';
import { Genre } from '../genres/genre.entity';
import { MovieGenre } from '../movies/movie-genre.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [
    Movie,
    User,
    Review,
    RevokedToken,
    Person,
    MovieCast,
    MovieCrew,
    Genre,
    MovieGenre,
  ],

  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  synchronize: false,
});
