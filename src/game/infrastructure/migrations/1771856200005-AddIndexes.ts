import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddIndexes1771856200005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX "IDX_game_sessions_user_id" ON "game_sessions" ("userId")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_characters_session_id" ON "characters" ("sessionId")`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_rooms_session_id" ON "rooms" ("sessionId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_rooms_session_id"`);
        await queryRunner.query(`DROP INDEX "IDX_characters_session_id"`);
        await queryRunner.query(`DROP INDEX "IDX_game_sessions_user_id"`);
    }
}
