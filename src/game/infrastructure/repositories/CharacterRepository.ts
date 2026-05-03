import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CharacterEntity} from '../../domain/entities/CharacterEntity';
import {ICharacterRepository} from '../../domain/interfaces/ICharacterRepository';
import {ICharacterStatUpdate} from '../../domain/interfaces/ICharacterStatUpdate';
import {CharacterStatsDto} from '../../domain/dtos/CharacterStatsDto';
import {statColumn} from '../../domain/enums/Stat';

@Injectable()
export class CharacterRepository implements ICharacterRepository {
    constructor(
        @InjectRepository(CharacterEntity)
        private readonly repo: Repository<CharacterEntity>,
    ) {}

    create(sessionId: number, stats: CharacterStatsDto): Promise<CharacterEntity> {
        const entity = this.repo.create({sessionId, ...stats});

        return this.repo.save(entity);
    }

    async updateHp(characterId: number, hp: number): Promise<void> {
        await this.repo.update(characterId, {hp});
    }

    async applyStatChange(characterId: number, change: ICharacterStatUpdate): Promise<void> {
        await this.repo.increment({id: characterId}, statColumn(change.stat), change.delta);

        if (change.maxHpDelta) {
            await this.repo.increment({id: characterId}, 'maxHp', change.maxHpDelta);
        }

        if (change.hpDelta) {
            await this.repo.increment({id: characterId}, 'hp', change.hpDelta);
        }
    }
}
