import {MigrationInterface, QueryRunner} from 'typeorm';

export class CompositeIndexes1771856200007 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_game_sessions_user_id"`);
        await queryRunner.query(
            `CREATE INDEX "IDX_game_sessions_user_status" ON "game_sessions" ("userId", "status")`,
        );

        await queryRunner.query(`DROP INDEX "IDX_rooms_session_id"`);
        await queryRunner.query(
            `CREATE INDEX "IDX_rooms_session_index" ON "rooms" ("sessionId", "index")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_rooms_session_index"`);
        await queryRunner.query(`CREATE INDEX "IDX_rooms_session_id" ON "rooms" ("sessionId")`);

        await queryRunner.query(`DROP INDEX "IDX_game_sessions_user_status"`);
        await queryRunner.query(
            `CREATE INDEX "IDX_game_sessions_user_id" ON "game_sessions" ("userId")`,
        );
    }
}
