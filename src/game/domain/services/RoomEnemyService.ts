import {Inject, Injectable, InternalServerErrorException} from '@nestjs/common';
import {RoomEnemyEntity} from '../entities/RoomEnemyEntity';
import {RoomEntity} from '../entities/RoomEntity';
import {IRoomEnemyRepository, ROOM_ENEMY_REPOSITORY} from '../interfaces/IRoomEnemyRepository';
import {ICombatantStats} from '../interfaces/ICombatantStats';
import {IRoomInfoResult} from '../../../base/domain/interfaces/game/IRoomInfoResult';

@Injectable()
export class RoomEnemyService {
    constructor(
        @Inject(ROOM_ENEMY_REPOSITORY)
        private readonly roomEnemyRepository: IRoomEnemyRepository,
    ) {}

    create(roomId: number, enemyId: number, maxHp: number): Promise<RoomEnemyEntity> {
        return this.roomEnemyRepository.create(roomId, enemyId, maxHp, maxHp);
    }

    async updateCurrentHp(id: number, currentHp: number): Promise<void> {
        return this.roomEnemyRepository.updateCurrentHp(id, currentHp);
    }

    toCombatantStats(roomEnemy: RoomEnemyEntity): ICombatantStats {
        return {
            hp: roomEnemy.currentHp,
            strength: roomEnemy.enemy.strength,
            endurance: roomEnemy.enemy.endurance,
            agility: roomEnemy.enemy.agility,
        };
    }

    buildRoomInfo(room: RoomEntity, playerHp: number, playerMaxHp: number): IRoomInfoResult {
        if (!room.roomEnemy) {
            throw new InternalServerErrorException(
                `Room ${room.id} (type ${room.type}) has no enemy`,
            );
        }

        return {
            roomNumber: room.layer,
            enemyName: room.roomEnemy.enemy.name,
            enemyHp: room.roomEnemy.currentHp,
            enemyMaxHp: room.roomEnemy.maxHp,
            playerHp,
            playerMaxHp,
        };
    }
}
