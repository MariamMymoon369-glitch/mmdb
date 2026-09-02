import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './movie.entity';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Review } from '../reviews/review.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Review, User])],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
