import {MigrationInterface, QueryRunner} from 'typeorm';

export class RoomInteractions1771856200009 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "interactionCount" INTEGER NOT NULL DEFAULT 0`,
        );
        await queryRunner.query(`UPDATE "rooms" SET "type" = 'CAMPFIRE' WHERE "type" = 'EMPTY'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN IF EXISTS "interactionCount"`);
    }
}
