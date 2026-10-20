import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActorDetailsTables1792500000000 implements MigrationInterface {
  name = 'AddActorDetailsTables1792500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "people" ADD "imdb_id" character varying(32)`,
    );
    await queryRunner.query(
      `ALTER TABLE "people" ADD "details_fetched_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "people" ADD "details_last_attempt_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "people" ADD "details_status" character varying(20) NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_people_imdb_id" ON "people" ("imdb_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_people_details_fetched_at" ON "people" ("details_fetched_at")`,
    );

    await queryRunner.query(
      `CREATE TABLE "person_movie_credits" ("id" SERIAL NOT NULL, "person_id" integer NOT NULL, "movie_id" integer, "tmdb_movie_id" integer NOT NULL, "title" character varying(255) NOT NULL, "release_year" integer, "character_name" character varying(255) NOT NULL, "poster_url" character varying(500), "billing_order" integer, "source" character varying(32) NOT NULL DEFAULT 'tmdb', "source_id" character varying(255), CONSTRAINT "PK_person_movie_credits" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_person_movie_credits_source" ON "person_movie_credits" ("person_id", "tmdb_movie_id", "character_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_person_movie_credits_person" ON "person_movie_credits" ("person_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_person_movie_credits_movie" ON "person_movie_credits" ("movie_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "person_movie_credits" ADD CONSTRAINT "FK_person_movie_credits_person" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "person_movie_credits" ADD CONSTRAINT "FK_person_movie_credits_movie" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "awards" ("id" SERIAL NOT NULL, "person_id" integer NOT NULL, "movie_id" integer, "year" integer, "body" text, "category" text, "result" character varying(20), "associated_movie_title" character varying(255), "associated_movie_year" integer, "associated_tmdb_movie_id" integer, "poster_url" character varying(500), "source" character varying(32) NOT NULL DEFAULT 'wikidata', "source_id" character varying(255), CONSTRAINT "PK_awards" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_awards_source" ON "awards" ("person_id", "source", "source_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_awards_person" ON "awards" ("person_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_awards_movie" ON "awards" ("movie_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "awards" ADD CONSTRAINT "FK_awards_person" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "awards" ADD CONSTRAINT "FK_awards_movie" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "awards" DROP CONSTRAINT "FK_awards_movie"`,
    );
    await queryRunner.query(
      `ALTER TABLE "awards" DROP CONSTRAINT "FK_awards_person"`,
    );
    await queryRunner.query(`DROP TABLE "awards"`);

    await queryRunner.query(
      `ALTER TABLE "person_movie_credits" DROP CONSTRAINT "FK_person_movie_credits_movie"`,
    );
    await queryRunner.query(
      `ALTER TABLE "person_movie_credits" DROP CONSTRAINT "FK_person_movie_credits_person"`,
    );
    await queryRunner.query(`DROP TABLE "person_movie_credits"`);

    await queryRunner.query(`DROP INDEX "IDX_people_details_fetched_at"`);
    await queryRunner.query(`DROP INDEX "IDX_people_imdb_id"`);
    await queryRunner.query(
      `ALTER TABLE "people" DROP COLUMN "details_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "people" DROP COLUMN "details_last_attempt_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "people" DROP COLUMN "details_fetched_at"`,
    );
    await queryRunner.query(`ALTER TABLE "people" DROP COLUMN "imdb_id"`);
  }
}
