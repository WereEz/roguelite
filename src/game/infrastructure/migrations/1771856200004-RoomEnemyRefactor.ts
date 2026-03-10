import {MigrationInterface, QueryRunner} from 'typeorm';

export class RoomEnemyRefactor1771856200004 implements MigrationInterface {
    name = 'RoomEnemyRefactor1771856200004';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "enemies" ADD COLUMN "baseHp" integer NOT NULL DEFAULT 1`,
        );
        await queryRunner.query(`UPDATE "enemies" SET "baseHp" = "maxHp"`);
        await queryRunner.query(`ALTER TABLE "enemies" DROP COLUMN "hp"`);
        await queryRunner.query(`ALTER TABLE "enemies" DROP COLUMN "maxHp"`);
        await queryRunner.query(`ALTER TABLE "enemies" ALTER COLUMN "baseHp" DROP DEFAULT`);

        await queryRunner.query(
            `CREATE TABLE "room_enemies" (
                "id"        SERIAL NOT NULL,
                "roomId"    integer NOT NULL,
                "enemyId"   integer NOT NULL,
                "currentHp" integer NOT NULL,
                "maxHp"     integer NOT NULL,
                CONSTRAINT "PK_room_enemies" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_room_enemies_roomId" UNIQUE ("roomId")
            )`,
        );
        await queryRunner.query(
            `ALTER TABLE "room_enemies"
                ADD CONSTRAINT "FK_room_enemies_room"
                FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "room_enemies"
                ADD CONSTRAINT "FK_room_enemies_enemy"
                FOREIGN KEY ("enemyId") REFERENCES "enemies"("id") ON DELETE NO ACTION`,
        );

        await queryRunner.query(
            `ALTER TABLE "rooms" DROP CONSTRAINT IF EXISTS "FK_0fcfec1907a55b197de17f35e09"`,
        );
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN IF EXISTS "enemyId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" ADD COLUMN "enemyId" integer`);
        await queryRunner.query(
            `ALTER TABLE "rooms"
                ADD CONSTRAINT "FK_0fcfec1907a55b197de17f35e09"
                FOREIGN KEY ("enemyId") REFERENCES "enemies"("id") ON DELETE NO ACTION`,
        );

        await queryRunner.query(
            `ALTER TABLE "room_enemies" DROP CONSTRAINT "FK_room_enemies_enemy"`,
        );
        await queryRunner.query(
            `ALTER TABLE "room_enemies" DROP CONSTRAINT "FK_room_enemies_room"`,
        );
        await queryRunner.query(`DROP TABLE "room_enemies"`);

        await queryRunner.query(
            `ALTER TABLE "enemies" ADD COLUMN "maxHp" integer NOT NULL DEFAULT 1`,
        );
        await queryRunner.query(`ALTER TABLE "enemies" ADD COLUMN "hp" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`UPDATE "enemies" SET "maxHp" = "baseHp", "hp" = "baseHp"`);
        await queryRunner.query(`ALTER TABLE "enemies" DROP COLUMN "baseHp"`);
        await queryRunner.query(`ALTER TABLE "enemies" ALTER COLUMN "maxHp" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "enemies" ALTER COLUMN "hp" DROP DEFAULT`);
    }
}
