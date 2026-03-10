import {Inject, Injectable} from '@nestjs/common';
import {EnemyEntity} from '../entities/EnemyEntity';
import {ENEMY_REPOSITORY, IEnemyRepository} from '../interfaces/IEnemyRepository';

@Injectable()
export class EnemyService {
    constructor(
        @Inject(ENEMY_REPOSITORY)
        private readonly enemyRepository: IEnemyRepository,
    ) {}

    findAll(): Promise<EnemyEntity[]> {
        return this.enemyRepository.findAll();
    }
}
