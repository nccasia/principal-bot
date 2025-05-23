import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigrate1746857539529 implements MigrationInterface {
    name = 'InitialMigrate1746857539529'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cv_forms" DROP CONSTRAINT "PK_8c6f24a899a6229366e8a03a0b6"`);
        await queryRunner.query(`ALTER TABLE "cv_forms" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "cv_forms" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cv_forms" ADD CONSTRAINT "PK_8c6f24a899a6229366e8a03a0b6" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cv_forms" DROP CONSTRAINT "PK_8c6f24a899a6229366e8a03a0b6"`);
        await queryRunner.query(`ALTER TABLE "cv_forms" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "cv_forms" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cv_forms" ADD CONSTRAINT "PK_8c6f24a899a6229366e8a03a0b6" PRIMARY KEY ("id")`);
    }

}
