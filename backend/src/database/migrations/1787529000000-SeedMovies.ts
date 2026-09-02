import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMovies1787529000000 implements MigrationInterface {
  name = 'SeedMovies1787529000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TEMP TABLE "seed_movies" (
        "title" TEXT,
        "release_year" INTEGER,
        "overview" TEXT,
        "poster_url" TEXT,
        "language" TEXT
      ) ON COMMIT DROP
    `);

    await queryRunner.query(`
      INSERT INTO "seed_movies" VALUES
        ('The Shawshank Redemption', 1994, 'Two imprisoned men find redemption through acts of common decency.', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'English'),
        ('The Godfather', 1972, 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.', 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'English'),
        ('The Dark Knight', 2008, 'Batman faces a criminal mastermind who plunges Gotham into chaos.', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'English'),
        ('Pulp Fiction', 1994, 'The lives of two hitmen, a boxer, and a crime boss intertwine in Los Angeles.', 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 'English'),
        ('Inception', 2010, 'A skilled thief enters dreams to steal secrets and plant an idea.', 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKqBflb8A3VqAu1D5.jpg', 'English'),
        ('The Matrix', 1999, 'A hacker discovers that reality is a simulated world and joins its rebellion.', 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', 'English'),
        ('Interstellar', 2014, 'Explorers travel through a wormhole in search of a new home for humanity.', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'English'),
        ('Parasite', 2019, 'A struggling family gradually enters the lives of a wealthy household.', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', 'Korean'),
        ('Spirited Away', 2001, 'A young girl enters a mysterious spirit world and must find her way home.', 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', 'Japanese'),
        ('Whiplash', 2014, 'A young drummer is pushed toward greatness by an uncompromising instructor.', 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg', 'English')
    `);

    await queryRunner.query(`
      UPDATE "movies" AS movie
      SET "poster_url" = seed."poster_url"
      FROM "seed_movies" AS seed
      WHERE movie."title" = seed."title"
    `);

    await queryRunner.query(`
      SELECT setval(
        pg_get_serial_sequence('movies', 'id'),
        COALESCE((SELECT MAX("id") FROM "movies"), 0) + 1,
        false
      )
    `);

    await queryRunner.query(`
      INSERT INTO "movies" (
        "title", "release_year", "overview", "poster_url", "language"
      )
      SELECT seed."title", seed."release_year", seed."overview", seed."poster_url", seed."language"
      FROM "seed_movies" AS seed
      WHERE NOT EXISTS (
        SELECT 1 FROM "movies" AS movie WHERE movie."title" = seed."title"
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "movies"
      WHERE "title" IN (
        'The Shawshank Redemption', 'The Godfather', 'The Dark Knight',
        'Pulp Fiction', 'Inception', 'The Matrix', 'Interstellar',
        'Parasite', 'Spirited Away', 'Whiplash'
      )
    `);
  }
}
