import { MigrationInterface, QueryRunner } from "typeorm";

export class NewEntities1747032831169 implements MigrationInterface {
    name = 'NewEntities1747032831169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "branches" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "address" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "branch_positions" ("id" SERIAL NOT NULL, "branchId" integer NOT NULL, "positionId" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5a186182cbd7d2140ec509a0f2b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "positions" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cv_sources" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c4e0591cb2da49b6149fc3fb075" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "branch_positions" ADD CONSTRAINT "FK_c161b40b64c225a3c54443a96f4" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branch_positions" ADD CONSTRAINT "FK_99e12f7e9b21eef2540ad7e8cec" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branch_positions" DROP CONSTRAINT "FK_99e12f7e9b21eef2540ad7e8cec"`);
        await queryRunner.query(`ALTER TABLE "branch_positions" DROP CONSTRAINT "FK_c161b40b64c225a3c54443a96f4"`);
        await queryRunner.query(`DROP TABLE "cv_sources"`);
        await queryRunner.query(`DROP TABLE "positions"`);
        await queryRunner.query(`DROP TABLE "branch_positions"`);
        await queryRunner.query(`DROP TABLE "branches"`);
    }

}
