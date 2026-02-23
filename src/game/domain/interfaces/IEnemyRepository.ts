import {EnemyEntity} from '../entities/EnemyEntity';

export const ENEMY_REPOSITORY = 'ENEMY_REPOSITORY';

export interface IEnemyRepository {
    findById(id: number): Promise<EnemyEntity | null>;
    findAll(): Promise<EnemyEntity[]>;
}
