import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRevokedTokens1788550000000 implements MigrationInterface {
  name = 'CreateRevokedTokens1788550000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "revoked_tokens" ("id" SERIAL NOT NULL, "jti" character varying(255) NOT NULL, "user_id" integer NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_revoked_tokens" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "revoked_tokens" ADD CONSTRAINT "UQ_revoked_tokens_jti" UNIQUE ("jti")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_revoked_tokens_expires_at" ON "revoked_tokens" ("expires_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "revoked_tokens"`);
  }
}
