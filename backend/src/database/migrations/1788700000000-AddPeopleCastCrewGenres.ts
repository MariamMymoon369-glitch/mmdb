import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPeopleCastCrewGenres1788700000000 implements MigrationInterface {
  name = 'AddPeopleCastCrewGenres1788700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "people" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "tmdb_id" integer, "name" character varying(255) NOT NULL, "photo_url" character varying(500), "biography" text, "gender" character varying(50), "birthdate" date, "place_of_birth" character varying(255), "known_for" character varying(255), CONSTRAINT "UQ_people_uuid" UNIQUE ("uuid"), CONSTRAINT "UQ_people_tmdb_id" UNIQUE ("tmdb_id"), CONSTRAINT "PK_people" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "genres" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "UQ_genres_name" UNIQUE ("name"), CONSTRAINT "PK_genres" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "movie_cast" ("movie_id" integer NOT NULL, "person_id" integer NOT NULL, "character_name" character varying(255) NOT NULL, "billing_order" integer, CONSTRAINT "PK_movie_cast" PRIMARY KEY ("movie_id", "person_id", "character_name"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "movie_crew" ("movie_id" integer NOT NULL, "person_id" integer NOT NULL, "job" character varying(50) NOT NULL, CONSTRAINT "PK_movie_crew" PRIMARY KEY ("movie_id", "person_id", "job"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "movie_genres" ("movie_id" integer NOT NULL, "genre_id" integer NOT NULL, CONSTRAINT "PK_movie_genres" PRIMARY KEY ("movie_id", "genre_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_cast" ADD CONSTRAINT "FK_movie_cast_movie" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_cast" ADD CONSTRAINT "FK_movie_cast_person" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_crew" ADD CONSTRAINT "FK_movie_crew_movie" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_crew" ADD CONSTRAINT "FK_movie_crew_person" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" ADD CONSTRAINT "FK_movie_genres_movie" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" ADD CONSTRAINT "FK_movie_genres_genre" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "title" character varying(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "rating" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "UQ_reviews_movie_user" UNIQUE ("movie_id", "user_uuid")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "UQ_reviews_movie_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "rating" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "title"`);
    await queryRunner.query(
      `ALTER TABLE "movie_genres" DROP CONSTRAINT "FK_movie_genres_genre"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_genres" DROP CONSTRAINT "FK_movie_genres_movie"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_crew" DROP CONSTRAINT "FK_movie_crew_person"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_crew" DROP CONSTRAINT "FK_movie_crew_movie"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_cast" DROP CONSTRAINT "FK_movie_cast_person"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_cast" DROP CONSTRAINT "FK_movie_cast_movie"`,
    );
    await queryRunner.query(`DROP TABLE "movie_genres"`);
    await queryRunner.query(`DROP TABLE "movie_crew"`);
    await queryRunner.query(`DROP TABLE "movie_cast"`);
    await queryRunner.query(`DROP TABLE "genres"`);
    await queryRunner.query(`DROP TABLE "people"`);
  }
}
