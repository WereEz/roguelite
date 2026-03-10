import {MigrationInterface, QueryRunner} from 'typeorm';

export class TelegramIdBigint1771840206064 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "telegramId" TYPE bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "telegramId" TYPE integer`);
    }
}
