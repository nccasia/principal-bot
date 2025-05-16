import { MigrationInterface, QueryRunner } from "typeorm";

export class NewUserEntity1747385288821 implements MigrationInterface {
    name = 'NewUserEntity1747385288821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "total_cv_submitted" integer NOT NULL, "max_allowed_cv_submitted" integer NOT NULL DEFAULT '20', "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
