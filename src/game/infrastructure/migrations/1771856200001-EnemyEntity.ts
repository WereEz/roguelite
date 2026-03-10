import {MigrationInterface, QueryRunner} from 'typeorm';

export class EnemyEntity1771856200001 implements MigrationInterface {
    name = 'EnemyEntity1771856200001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "enemies" (
                "id"        SERIAL NOT NULL,
                "name"      character varying NOT NULL,
                "strength"  integer NOT NULL,
                "endurance" integer NOT NULL,
                "agility"   integer NOT NULL,
                "hp"        integer NOT NULL,
                "maxHp"     integer NOT NULL,
                CONSTRAINT "PK_4f4889aaaa4e3b73208dfca98aa" PRIMARY KEY ("id")
            )`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "enemies"`);
    }
}
