import {Inject, Injectable} from '@nestjs/common';
import {RoomEnemyEntity} from '../entities/RoomEnemyEntity';
import {IRoomEnemyRepository, ROOM_ENEMY_REPOSITORY} from '../interfaces/IRoomEnemyRepository';

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
}
