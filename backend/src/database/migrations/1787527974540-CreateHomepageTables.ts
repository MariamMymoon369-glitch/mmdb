import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHomepageTables1787527974540 implements MigrationInterface {
  name = 'CreateHomepageTables1787527974540';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "movies" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "title" text NOT NULL, "release_year" integer NOT NULL, "runtime_minutes" integer, "overview" text, "poster_url" text, "trailer_url" text, "language" text, CONSTRAINT "UQ_53395cfedf4627c8ffbe14811d0" UNIQUE ("uuid"), CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" text NOT NULL, "display_name" text NOT NULL, "password_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "movie_id" integer NOT NULL, "user_id" integer NOT NULL, "rating" integer NOT NULL, "body" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f2ccc5d85d7f3393c7f975395f7" UNIQUE ("uuid"), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "movies"`);
  }
}
