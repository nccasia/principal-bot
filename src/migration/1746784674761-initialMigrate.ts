import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigrate1746784674761 implements MigrationInterface {
    name = 'InitialMigrate1746784674761'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cv_forms" ("id" uuid NOT NULL, "fullname" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "candidate_type" character varying NOT NULL, "position" character varying NOT NULL, "branch" character varying NOT NULL, "cv_source" character varying NOT NULL, "gender" character varying NOT NULL, "dob" date, "address" text, "note" text, "attachment_url" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_0c24d050517b02374916e873871" UNIQUE ("email"), CONSTRAINT "PK_8c6f24a899a6229366e8a03a0b6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cv_forms"`);
    }

}
