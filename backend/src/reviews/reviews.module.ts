import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Movie } from '../movies/movie.entity';
import { User } from '../users/user.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { MoviesModule } from '../movies/movies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Movie, User]), MoviesModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
