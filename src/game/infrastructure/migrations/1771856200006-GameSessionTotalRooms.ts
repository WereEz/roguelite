import {MigrationInterface, QueryRunner} from 'typeorm';

export class GameSessionTotalRooms1771856200006 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "game_sessions" ADD COLUMN "totalRooms" integer NOT NULL DEFAULT 0`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_sessions" DROP COLUMN "totalRooms"`);
    }
}
