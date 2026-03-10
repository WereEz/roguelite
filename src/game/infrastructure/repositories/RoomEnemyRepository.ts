import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {RoomEnemyEntity} from '../../domain/entities/RoomEnemyEntity';
import {IRoomEnemyRepository} from '../../domain/interfaces/IRoomEnemyRepository';

@Injectable()
export class RoomEnemyRepository implements IRoomEnemyRepository {
    constructor(
        @InjectRepository(RoomEnemyEntity)
        private readonly repo: Repository<RoomEnemyEntity>,
    ) {}

    create(
        roomId: number,
        enemyId: number,
        currentHp: number,
        maxHp: number,
    ): Promise<RoomEnemyEntity> {
        const entity = this.repo.create({roomId, enemyId, currentHp, maxHp});

        return this.repo.save(entity);
    }

    async updateCurrentHp(id: number, currentHp: number): Promise<void> {
        await this.repo.update(id, {currentHp});
    }
}
