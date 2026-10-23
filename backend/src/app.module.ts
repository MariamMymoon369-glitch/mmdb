import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PeopleModule } from './people/people.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { WikidataModule } from './wikidata/wikidata.module';
import { SearchModule } from './search/search.module';
import { GenresModule } from './genres/genres.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3000),
        CLIENT_URL: Joi.string().uri().default('http://localhost:5173'),
        JWT_SECRET: Joi.string().min(1).required(),
        DB_HOST: Joi.string().min(1).required(),
        DB_PORT: Joi.number().port().required(),
        DB_USERNAME: Joi.string().min(1).required(),
        DB_PASSWORD: Joi.string().allow('').required(),
        DB_DATABASE: Joi.string().min(1).required(),
        TMDB_API_KEY: Joi.string().allow('').optional(),
        TMDB_READ_TOKEN: Joi.string().allow('').optional(),
      }).unknown(true),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    MoviesModule,

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),

        autoLoadEntities: true,
        synchronize: false,
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        migrationsRun: true,
      }),
    }),

    UsersModule,

    AuthModule,

    ReviewsModule,

    PeopleModule,

    TmdbModule,

    WikidataModule,

    SearchModule,

    GenresModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
