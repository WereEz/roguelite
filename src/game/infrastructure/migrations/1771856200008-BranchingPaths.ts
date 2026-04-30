import {MigrationInterface, QueryRunner} from 'typeorm';

export class BranchingPaths1771856200008 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rooms_session_index"`);
        await queryRunner.query(`ALTER TABLE "game_sessions" DROP COLUMN IF EXISTS "currentRoomIndex"`);
        await queryRunner.query(`ALTER TABLE "game_sessions" DROP COLUMN IF EXISTS "totalRooms"`);
        await queryRunner.query(
            `ALTER TABLE "game_sessions" ADD COLUMN "currentRoomId" INTEGER DEFAULT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "game_sessions" ADD CONSTRAINT "FK_game_sessions_currentRoom" FOREIGN KEY ("currentRoomId") REFERENCES "rooms"("id") ON DELETE SET NULL`,
        );
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN IF EXISTS "index"`);
        await queryRunner.query(
            `ALTER TABLE "rooms" ADD COLUMN "layer" INTEGER NOT NULL DEFAULT 0`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_rooms_session_layer" ON "rooms" ("sessionId", "layer")`,
        );
        await queryRunner.query(
            `ALTER TABLE "rooms" ADD COLUMN "direction" TEXT NOT NULL DEFAULT 'center'`,
        );
        await queryRunner.query(`
            CREATE TABLE "room_connections" (
                "fromRoomId" INTEGER NOT NULL,
                "toRoomId" INTEGER NOT NULL,
                PRIMARY KEY ("fromRoomId", "toRoomId"),
                FOREIGN KEY ("fromRoomId") REFERENCES "rooms"("id") ON DELETE CASCADE,
                FOREIGN KEY ("toRoomId") REFERENCES "rooms"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "room_connections"`);
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN IF EXISTS "direction"`);
        await queryRunner.query(
            `ALTER TABLE "game_sessions" DROP CONSTRAINT IF EXISTS "FK_game_sessions_currentRoom"`,
        );
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rooms_session_layer"`);
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN IF EXISTS "layer"`);
        await queryRunner.query(
            `ALTER TABLE "rooms" ADD COLUMN "index" INTEGER NOT NULL DEFAULT 0`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_rooms_session_index" ON "rooms" ("sessionId", "index")`,
        );
        await queryRunner.query(
            `ALTER TABLE "game_sessions" DROP COLUMN IF EXISTS "currentRoomId"`,
        );
        await queryRunner.query(
            `ALTER TABLE "game_sessions" ADD COLUMN "totalRooms" INTEGER NOT NULL DEFAULT 0`,
        );
        await queryRunner.query(
            `ALTER TABLE "game_sessions" ADD COLUMN "currentRoomIndex" INTEGER NOT NULL DEFAULT 0`,
        );
    }
}