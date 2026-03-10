import {MigrationInterface, QueryRunner} from 'typeorm';

export class GameSessionEntity1771856200000 implements MigrationInterface {
    name = 'GameSessionEntity1771856200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "game_sessions" (
                "id"               SERIAL NOT NULL,
                "userId"           integer NOT NULL,
                "status"           character varying NOT NULL DEFAULT 'ACTIVE',
                "currentRoomIndex" integer NOT NULL DEFAULT '0',
                "createdAt"        TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt"        TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e25fa82d55744e55000c3288fdc" PRIMARY KEY ("id")
            )`,
        );
        await queryRunner.query(
            `ALTER TABLE "game_sessions"
                ADD CONSTRAINT "FK_6fafb2f50848b51f214a1cbce2f"
                FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "game_sessions" DROP CONSTRAINT "FK_6fafb2f50848b51f214a1cbce2f"`,
        );
        await queryRunner.query(`DROP TABLE "game_sessions"`);
    }
}
