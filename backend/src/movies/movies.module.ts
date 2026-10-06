import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './movie.entity';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Review } from '../reviews/review.entity';
import { User } from '../users/user.entity';
import { MovieCast } from './movie-cast.entity';
import { MovieCrew } from './movie-crew.entity';
import { MovieGenre } from './movie-genre.entity';
import { Genre } from '../genres/genre.entity';
import { Person } from '../people/person.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      Review,
      User,
      MovieCast,
      MovieCrew,
      MovieGenre,
      Genre,
      Person,
    ]),
    AuthModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
