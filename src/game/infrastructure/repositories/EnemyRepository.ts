import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {EnemyEntity} from '../../domain/entities/EnemyEntity';
import {IEnemyRepository} from '../../domain/interfaces/IEnemyRepository';

@Injectable()
export class EnemyRepository implements IEnemyRepository {
    constructor(
        @InjectRepository(EnemyEntity)
        private readonly repo: Repository<EnemyEntity>,
    ) {}

    findById(id: number): Promise<EnemyEntity | null> {
        return this.repo.findOne({where: {id}});
    }

    findAll(): Promise<EnemyEntity[]> {
        return this.repo.find();
    }
}
