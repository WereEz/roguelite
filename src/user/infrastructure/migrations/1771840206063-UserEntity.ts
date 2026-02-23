import {MigrationInterface, QueryRunner} from 'typeorm';

export class UserEntity1771840206063 implements MigrationInterface {
    name = 'UserEntity1771840206063';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "users" (
                "id" SERIAL NOT NULL, 
                "telegramId" integer NOT NULL, 
                "username" character varying, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "UQ_df18d17f84763558ac84192c754" UNIQUE ("telegramId"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
