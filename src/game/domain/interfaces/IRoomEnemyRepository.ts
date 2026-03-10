import {RoomEnemyEntity} from '../entities/RoomEnemyEntity';

export const ROOM_ENEMY_REPOSITORY = 'ROOM_ENEMY_REPOSITORY';

export interface IRoomEnemyRepository {
    create(
        roomId: number,
        enemyId: number,
        currentHp: number,
        maxHp: number,
    ): Promise<RoomEnemyEntity>;
    updateCurrentHp(id: number, currentHp: number): Promise<void>;
}
