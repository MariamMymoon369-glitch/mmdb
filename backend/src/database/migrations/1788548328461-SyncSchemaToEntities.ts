import { MigrationInterface, QueryRunner } from 'typeorm';

// Syncs the database schema to the current entities without data loss.
// (The auto-generated diff wanted DROP/ADD COLUMN on populated tables,
// which fails on NOT NULL columns and wipes data; these ALTERs are equivalent.)
export class SyncSchemaToEntities1788548328461 implements MigrationInterface {
  name = 'SyncSchemaToEntities1788548328461';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- users: new columns (table is empty, plain ADD is safe) ---
    await queryRunner.query(
      `ALTER TABLE "users" ADD "uuid" uuid NOT NULL DEFAULT gen_random_uuid()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_951b8f1dfc94ac1d0301a14b7e1" UNIQUE ("uuid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "first_name" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_name" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profile_picture_url" character varying DEFAULT 'https://ui-avatars.com/api/?name=User&background=random'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "display_name" TYPE character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password_hash" TYPE character varying(255)`,
    );

    // --- reviews: rename FK column instead of drop/add ---
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" RENAME COLUMN "user_id" TO "user_uuid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_78b1a0e7e5d4c6d4f106cbf8de2" FOREIGN KEY ("user_uuid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // --- movies: type changes only, data preserved ---
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "title" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "poster_url" TYPE character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "trailer_url" TYPE character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "language" TYPE character varying(50)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "language" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "trailer_url" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "poster_url" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ALTER COLUMN "title" TYPE text`,
    );

    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_78b1a0e7e5d4c6d4f106cbf8de2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" RENAME COLUMN "user_uuid" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password_hash" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "display_name" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "profile_picture_url"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_951b8f1dfc94ac1d0301a14b7e1"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "uuid"`);
  }
}
