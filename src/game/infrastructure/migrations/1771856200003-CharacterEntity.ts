import {MigrationInterface, QueryRunner} from 'typeorm';

export class CharacterEntity1771856200003 implements MigrationInterface {
    name = 'CharacterEntity1771856200003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "characters" (
                "id"        SERIAL NOT NULL,
                "sessionId" integer NOT NULL,
                "strength"  integer NOT NULL,
                "endurance" integer NOT NULL,
                "agility"   integer NOT NULL,
                "hp"        integer NOT NULL,
                "maxHp"     integer NOT NULL,
                CONSTRAINT "REL_9506983479d675b759452aba9e" UNIQUE ("sessionId"),
                CONSTRAINT "PK_9d731e05758f26b9315dac5e378" PRIMARY KEY ("id")
            )`,
        );
        await queryRunner.query(
            `ALTER TABLE "characters"
                ADD CONSTRAINT "FK_9506983479d675b759452aba9e5"
                FOREIGN KEY ("sessionId") REFERENCES "game_sessions"("id") ON DELETE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "characters" DROP CONSTRAINT "FK_9506983479d675b759452aba9e5"`,
        );
        await queryRunner.query(`DROP TABLE "characters"`);
    }
}
