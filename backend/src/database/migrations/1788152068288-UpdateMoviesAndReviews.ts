import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMoviesAndReviews1788152068288 implements MigrationInterface {
  name = 'UpdateMoviesAndReviews1788152068288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movies" ADD "rating" numeric(3,1) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ADD "review_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "uuid" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid()`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "body"`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "body" character varying(1000)`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "uuid" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "uuid" SET DEFAULT gen_random_uuid()`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "CHK_d8c138aaf1f801cb835b445359" CHECK ("rating" >= 1 AND "rating" <= 10)`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_563501cf3faa75a1ca40be84f82" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_563501cf3faa75a1ca40be84f82"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "CHK_d8c138aaf1f801cb835b445359"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "uuid" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "uuid" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "body"`);
    await queryRunner.query(`ALTER TABLE "reviews" ADD "body" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "uuid" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ALTER COLUMN "uuid" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "review_count"`);
    await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "rating"`);
  }
}
