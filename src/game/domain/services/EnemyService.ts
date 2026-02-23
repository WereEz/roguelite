import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import {EnemyEntity} from '../entities/EnemyEntity';
import {ENEMY_REPOSITORY, IEnemyRepository} from '../interfaces/IEnemyRepository';

@Injectable()
export class EnemyService {
    constructor(
        @Inject(ENEMY_REPOSITORY)
        private readonly enemyRepository: IEnemyRepository,
    ) {}

    async findById(id: number): Promise<EnemyEntity> {
        const enemy = await this.enemyRepository.findById(id);

        if (!enemy) {
            throw new NotFoundException(`Enemy ${id} not found.`);
        }

        return enemy;
    }

    findAll(): Promise<EnemyEntity[]> {
        return this.enemyRepository.findAll();
    }
}
