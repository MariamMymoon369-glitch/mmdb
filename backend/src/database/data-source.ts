import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Movie } from '../movies/movie.entity';
import { User } from '../users/user.entity';
import { Review } from '../reviews/review.entity';
import { RevokedToken } from '../auth/revoked-token.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [Movie, User, Review, RevokedToken],

  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  synchronize: false,
});
