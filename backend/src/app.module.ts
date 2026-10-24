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
        // Prefer a single connection string (e.g. Neon) when it is provided;
        // otherwise fall back to the individual DB_* settings used locally.
        DATABASE_URL: Joi.string().uri().optional(),
        DB_HOST: Joi.when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.string().optional(),
          otherwise: Joi.string().min(1).required(),
        }),
        DB_PORT: Joi.when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.number().port().optional(),
          otherwise: Joi.number().port().required(),
        }),
        DB_USERNAME: Joi.when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.string().optional(),
          otherwise: Joi.string().min(1).required(),
        }),
        DB_PASSWORD: Joi.when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.string().allow('').optional(),
          otherwise: Joi.string().allow('').required(),
        }),
        DB_DATABASE: Joi.when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.string().optional(),
          otherwise: Joi.string().min(1).required(),
        }),
        DB_SSL: Joi.boolean().default(false),
        DB_RUN_MIGRATIONS: Joi.boolean().default(true),
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
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('DATABASE_URL');
        const ssl = configService.get<boolean | string>('DB_SSL');
        const runMigrations = configService.get<boolean | string>(
          'DB_RUN_MIGRATIONS',
        );

        const sslDisabled = ssl === false || ssl === 'false';
        const useSsl =
          ssl === true || ssl === 'true' || (Boolean(url) && !sslDisabled)
            ? true
            : undefined;

        const connection = url
          ? { url, ssl: useSsl }
          : {
              host: configService.get<string>('DB_HOST'),
              port: configService.get<number>('DB_PORT'),
              username: configService.get<string>('DB_USERNAME'),
              password: configService.get<string>('DB_PASSWORD'),
              database: configService.get<string>('DB_DATABASE'),
              ssl: useSsl,
            };

        return {
          type: 'postgres',
          ...connection,

          autoLoadEntities: true,
          synchronize: false,
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          migrationsRun: !(
            runMigrations === false || runMigrations === 'false'
          ),
        };
      },
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
