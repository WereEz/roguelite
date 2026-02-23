import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CharacterEntity} from '../../domain/entities/CharacterEntity';
import {ICharacterRepository} from '../../domain/interfaces/ICharacterRepository';
import {CharacterStatsDto} from '../../domain/dtos/CharacterStatsDto';

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

    findBySessionId(sessionId: number): Promise<CharacterEntity | null> {
        return this.repo.findOne({where: {sessionId}});
    }
}
