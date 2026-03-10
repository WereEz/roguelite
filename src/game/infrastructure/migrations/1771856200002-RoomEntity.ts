import {MigrationInterface, QueryRunner} from 'typeorm';

export class RoomEntity1771856200002 implements MigrationInterface {
    name = 'RoomEntity1771856200002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "rooms" (
                "id"         SERIAL NOT NULL,
                "sessionId"  integer NOT NULL,
                "index"      integer NOT NULL,
                "type"       character varying NOT NULL,
                "enemyId"    integer,
                "isComplete" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id")
            )`,
        );
        await queryRunner.query(
            `ALTER TABLE "rooms"
                ADD CONSTRAINT "FK_fb8736af9969cac19b0e25a4dfa"
                FOREIGN KEY ("sessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "rooms"
                ADD CONSTRAINT "FK_0fcfec1907a55b197de17f35e09"
                FOREIGN KEY ("enemyId") REFERENCES "enemies"("id") ON DELETE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "rooms" DROP CONSTRAINT "FK_0fcfec1907a55b197de17f35e09"`,
        );
        await queryRunner.query(
            `ALTER TABLE "rooms" DROP CONSTRAINT "FK_fb8736af9969cac19b0e25a4dfa"`,
        );
        await queryRunner.query(`DROP TABLE "rooms"`);
    }
}
