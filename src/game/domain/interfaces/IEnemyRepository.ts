import {EnemyEntity} from '../entities/EnemyEntity';

export const ENEMY_REPOSITORY = 'ENEMY_REPOSITORY';

export interface IEnemyRepository {
    findAll(): Promise<EnemyEntity[]>;
}
