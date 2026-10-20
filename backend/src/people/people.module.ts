import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './person.entity';
import { PersonMovieCredit } from './person-movie-credit.entity';
import { Award } from './award.entity';
import { Movie } from '../movies/movie.entity';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';
import { TmdbModule } from '../tmdb/tmdb.module';
import { WikidataModule } from '../wikidata/wikidata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person, PersonMovieCredit, Award, Movie]),
    TmdbModule,
    WikidataModule,
  ],
  controllers: [PeopleController],
  providers: [PeopleService],
  exports: [PeopleService],
})
export class PeopleModule {}
