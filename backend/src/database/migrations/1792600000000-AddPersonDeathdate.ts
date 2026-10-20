import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPersonDeathdate1792600000000 implements MigrationInterface {
  name = 'AddPersonDeathdate1792600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "people" ADD "deathdate" date`);
    await queryRunner.query(
      `CREATE INDEX "IDX_people_deathdate" ON "people" ("deathdate")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_people_deathdate"`);
    await queryRunner.query(`ALTER TABLE "people" DROP COLUMN "deathdate"`);
  }
}
